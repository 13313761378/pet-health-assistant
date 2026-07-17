package com.pethealth.assistant.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.pethealth.assistant.config.WechatProperties;
import java.net.URI;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClient;

class WechatApiClientTests {

    @Test
    void reportsMissingWechatConfigurationWithoutCallingNetwork() {
        WechatApiClient client = new WechatApiClient(
                RestClient.builder(),
                new WechatProperties("", "", URI.create("https://api.weixin.qq.com/sns/jscode2session")));

        assertThatThrownBy(() -> client.exchangeCode("code"))
                .isInstanceOfSatisfying(WechatLoginException.class, exception -> {
                    assertThat(exception.status()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
                    assertThat(exception.getMessage()).contains("WECHAT_APP_ID");
                });
    }
}
