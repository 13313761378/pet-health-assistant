package com.pethealth.assistant.health;

public record ComponentHealth(String status, String message) {
    static ComponentHealth up(String message) {
        return new ComponentHealth("UP", message);
    }

    static ComponentHealth down(String message) {
        return new ComponentHealth("DOWN", message);
    }
}
