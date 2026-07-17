package com.pethealth.assistant.health;

import com.pethealth.assistant.config.MinioProperties;
import io.minio.BucketExistsArgs;
import io.minio.MinioClient;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class SystemHealthService {

    private final JdbcTemplate jdbcTemplate;
    private final RedisConnectionFactory redisConnectionFactory;
    private final MinioClient minioClient;
    private final MinioProperties minioProperties;

    public SystemHealthService(
            JdbcTemplate jdbcTemplate,
            RedisConnectionFactory redisConnectionFactory,
            MinioClient minioClient,
            MinioProperties minioProperties) {
        this.jdbcTemplate = jdbcTemplate;
        this.redisConnectionFactory = redisConnectionFactory;
        this.minioClient = minioClient;
        this.minioProperties = minioProperties;
    }

    public SystemHealthResponse check() {
        Map<String, ComponentHealth> components = new LinkedHashMap<>();
        components.put("mysql", checkMysql());
        components.put("redis", checkRedis());
        components.put("minio", checkMinio());
        boolean allUp = components.values().stream().allMatch(component -> "UP".equals(component.status()));
        return new SystemHealthResponse(allUp ? "UP" : "DEGRADED", Instant.now(), components);
    }

    private ComponentHealth checkMysql() {
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return Integer.valueOf(1).equals(result) ? ComponentHealth.up("MySQL connection is available") : ComponentHealth.down("Unexpected MySQL response");
        } catch (Exception exception) {
            return ComponentHealth.down(safeMessage(exception));
        }
    }

    private ComponentHealth checkRedis() {
        try (var connection = redisConnectionFactory.getConnection()) {
            String pong = connection.ping();
            return "PONG".equalsIgnoreCase(pong) ? ComponentHealth.up("Redis connection is available") : ComponentHealth.down("Unexpected Redis response");
        } catch (Exception exception) {
            return ComponentHealth.down(safeMessage(exception));
        }
    }

    private ComponentHealth checkMinio() {
        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(minioProperties.bucket()).build());
            return exists ? ComponentHealth.up("MinIO bucket is available") : ComponentHealth.down("Configured MinIO bucket does not exist");
        } catch (Exception exception) {
            return ComponentHealth.down(safeMessage(exception));
        }
    }

    private String safeMessage(Exception exception) {
        String message = exception.getMessage();
        return message == null || message.isBlank() ? exception.getClass().getSimpleName() : message;
    }
}
