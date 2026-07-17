package com.pethealth.assistant.admin;

import com.pethealth.assistant.security.JwtService;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminAuthService {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    public AdminAuthService(JdbcTemplate jdbc, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.jdbc = jdbc; this.passwordEncoder = passwordEncoder; this.jwtService = jwtService;
    }
    @Transactional
    public LoginResponse login(String username, String password) {
        var users = jdbc.query("SELECT id,username,password_hash,display_name,status FROM admin_users WHERE username=?",
                (rs, row) -> new AdminRow(rs.getLong("id"), rs.getString("username"), rs.getString("password_hash"), rs.getString("display_name"), rs.getString("status")), username);
        if (users.isEmpty() || !"ACTIVE".equals(users.getFirst().status()) || !passwordEncoder.matches(password, users.getFirst().passwordHash()))
            throw new BadCredentialsException("用户名或密码错误");
        AdminRow user = users.getFirst();
        List<String> roles = jdbc.queryForList("SELECT r.code FROM admin_roles r JOIN admin_user_roles ur ON ur.role_id=r.id WHERE ur.admin_user_id=?", String.class, user.id());
        jdbc.update("UPDATE admin_users SET last_login_at=CURRENT_TIMESTAMP(3) WHERE id=?", user.id());
        return new LoginResponse(jwtService.createAdminAccessToken(user.id(), roles), new AdminProfile(user.id(), user.username(), user.displayName(), roles, permissions(user.id())));
    }
    public AdminProfile profile(Long id) {
        Map<String,Object> row = jdbc.queryForMap("SELECT id,username,display_name FROM admin_users WHERE id=? AND status='ACTIVE'", id);
        List<String> roles = jdbc.queryForList("SELECT r.code FROM admin_roles r JOIN admin_user_roles ur ON ur.role_id=r.id WHERE ur.admin_user_id=?", String.class, id);
        return new AdminProfile(((Number)row.get("id")).longValue(), (String)row.get("username"), (String)row.get("display_name"), roles, permissions(id));
    }
    private List<String> permissions(Long id) {
        return jdbc.queryForList("SELECT DISTINCT p.code FROM admin_permissions p JOIN admin_role_permissions rp ON rp.permission_id=p.id JOIN admin_user_roles ur ON ur.role_id=rp.role_id WHERE ur.admin_user_id=? ORDER BY p.code", String.class, id);
    }
    private record AdminRow(Long id,String username,String passwordHash,String displayName,String status) {}
    public record AdminProfile(Long id,String username,String displayName,List<String> roles,List<String> permissions) {}
    public record LoginResponse(String accessToken,AdminProfile admin) {}
}
