package com.pethealth.assistant.health;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Map;
import org.junit.jupiter.api.Test;

class SystemHealthControllerTests {

    @Test
    void returnsHealthResponse() {
        SystemHealthService service = mock(SystemHealthService.class);
        SystemHealthResponse expected = new SystemHealthResponse(
                "UP",
                Instant.parse("2026-07-16T00:00:00Z"),
                Map.of("mysql", ComponentHealth.up("ok")));
        when(service.check()).thenReturn(expected);

        var response = new SystemHealthController(service).health();

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isEqualTo(expected);
    }
}
