package com.pethealth.assistant.config;

import java.net.URI;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.wechat")
public record WechatProperties(String appId, String appSecret, URI sessionUrl) {

    public boolean isConfigured() {
        return appId != null && !appId.isBlank() && appSecret != null && !appSecret.isBlank();
    }
}
