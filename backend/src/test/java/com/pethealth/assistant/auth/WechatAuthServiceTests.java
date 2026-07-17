package com.pethealth.assistant.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.pethealth.assistant.config.JwtProperties;
import com.pethealth.assistant.security.JwtService;
import com.pethealth.assistant.user.User;
import com.pethealth.assistant.user.UserMapper;
import java.time.Duration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class WechatAuthServiceTests {

    private WechatApiClient apiClient;
    private UserMapper userMapper;
    private JwtService jwtService;
    private WechatAuthService service;

    @BeforeEach
    void setUp() {
        apiClient = mock(WechatApiClient.class);
        userMapper = mock(UserMapper.class);
        jwtService = mock(JwtService.class);
        service = new WechatAuthService(
                apiClient,
                userMapper,
                jwtService,
                new JwtProperties("test-secret-test-secret-test-secret-1234", Duration.ofHours(2)));
    }

    @Test
    void logsInExistingUserAndReturnsToken() {
        User user = new User();
        user.setId(7L);
        user.setWechatOpenid("openid-1");
        user.setNickname("豆包家长");
        when(apiClient.exchangeCode("code-1"))
                .thenReturn(new WechatSession("openid-1", "session", null, null, null));
        when(userMapper.selectOne(any(Wrapper.class))).thenReturn(user);
        when(jwtService.createAccessToken("7")).thenReturn("jwt-token");

        WechatLoginResponse response = service.login(new WechatLoginRequest("code-1", null, null));

        assertThat(response.accessToken()).isEqualTo("jwt-token");
        assertThat(response.expiresIn()).isEqualTo(7200);
        assertThat(response.user().id()).isEqualTo(7L);
    }

    @Test
    void createsUserOnFirstLogin() {
        when(apiClient.exchangeCode("new-code"))
                .thenReturn(new WechatSession("new-openid", "session", "union-1", null, null));
        when(userMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        doAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(9L);
            return 1;
        }).when(userMapper).insert(any(User.class));
        when(jwtService.createAccessToken("9")).thenReturn("new-jwt");

        WechatLoginResponse response = service.login(
                new WechatLoginRequest("new-code", " 新用户 ", "https://example.test/avatar.png"));

        assertThat(response.accessToken()).isEqualTo("new-jwt");
        assertThat(response.user().nickname()).isEqualTo("新用户");
        verify(userMapper).insert(any(User.class));
    }
}
