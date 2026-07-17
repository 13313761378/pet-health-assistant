package com.pethealth.assistant.auth;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pethealth.assistant.api.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class WechatAuthControllerTests {

    private WechatAuthService authService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        authService = mock(WechatAuthService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new WechatAuthController(authService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void rejectsMissingWechatCode() throws Exception {
        mockMvc.perform(post("/api/auth/wechat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.code").value("微信登录 code 不能为空"));
    }

    @Test
    void returnsJwtForValidCode() throws Exception {
        when(authService.login(any())).thenReturn(new WechatLoginResponse(
                "jwt-token", "Bearer", 7200, new WechatLoginResponse.UserView(1L, "微信用户", null)));

        mockMvc.perform(post("/api/auth/wechat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"temporary-code\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("jwt-token"))
                .andExpect(jsonPath("$.user.id").value(1));
    }
}
