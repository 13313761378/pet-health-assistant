package com.pethealth.assistant.auth;

import com.pethealth.assistant.config.WechatProperties;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class WechatApiClient {

    private final RestClient restClient;
    private final WechatProperties properties;

    public WechatApiClient(RestClient.Builder builder, WechatProperties properties) {
        this.restClient = builder.build();
        this.properties = properties;
    }

    public WechatSession exchangeCode(String code) {
        if (!properties.isConfigured()) {
            throw new WechatLoginException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "微信登录尚未配置，请先设置 WECHAT_APP_ID 和 WECHAT_APP_SECRET");
        }

        try {
            var uri = UriComponentsBuilder.fromUri(properties.sessionUrl())
                    .queryParam("appid", properties.appId())
                    .queryParam("secret", properties.appSecret())
                    .queryParam("js_code", code)
                    .queryParam("grant_type", "authorization_code")
                    .build(true)
                    .toUri();
            WechatSession session = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(WechatSession.class);
            if (session == null || !session.succeeded()) {
                String detail = session == null ? "微信服务器未返回结果" : session.errmsg();
                throw new WechatLoginException(HttpStatus.UNAUTHORIZED, "微信登录失败：" + detail);
            }
            return session;
        } catch (WechatLoginException exception) {
            throw exception;
        } catch (RestClientException exception) {
            throw new WechatLoginException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "暂时无法连接微信登录服务",
                    exception);
        }
    }
}
