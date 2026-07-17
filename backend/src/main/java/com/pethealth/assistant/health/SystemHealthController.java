package com.pethealth.assistant.health;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class SystemHealthController {

    private final SystemHealthService healthService;

    public SystemHealthController(SystemHealthService healthService) {
        this.healthService = healthService;
    }

    @GetMapping
    public ResponseEntity<SystemHealthResponse> health() {
        SystemHealthResponse response = healthService.check();
        return ResponseEntity.ok(response);
    }
}
