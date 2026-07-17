package com.pethealth.assistant.auth;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.pethealth.assistant.config.JwtProperties;
import com.pethealth.assistant.security.JwtService;
import com.pethealth.assistant.user.User;
import com.pethealth.assistant.user.UserMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class WechatAuthService {

    private final WechatApiClient wechatApiClient;
    private final UserMapper userMapper;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    public WechatAuthService(
            WechatApiClient wechatApiClient,
            UserMapper userMapper,
            JwtService jwtService,
            JwtProperties jwtProperties) {
        this.wechatApiClient = wechatApiClient;
        this.userMapper = userMapper;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
    }

    @Transactional
    public WechatLoginResponse login(WechatLoginRequest request) {
        WechatSession session = wechatApiClient.exchangeCode(request.code());
        User user = userMapper.selectOne(Wrappers.<User>lambdaQuery()
                .eq(User::getWechatOpenid, session.openid())
                .last("LIMIT 1"));

        if (user == null) {
            user = createUser(session, request);
        } else if (refreshProfile(user, session, request)) {
            userMapper.updateById(user);
        }

        String accessToken = jwtService.createAccessToken(user.getId().toString());
        return new WechatLoginResponse(
                accessToken,
                "Bearer",
                jwtProperties.accessTokenTtl().toSeconds(),
                new WechatLoginResponse.UserView(user.getId(), user.getNickname(), user.getAvatarUrl()));
    }

    private User createUser(WechatSession session, WechatLoginRequest request) {
        User user = new User();
        user.setWechatOpenid(session.openid());
        user.setWechatUnionid(session.unionid());
        user.setNickname(StringUtils.hasText(request.nickname()) ? request.nickname().trim() : "微信用户");
        user.setAvatarUrl(request.avatarUrl());
        user.setStatus("ACTIVE");
        user.setDeleted(0);
        userMapper.insert(user);
        return user;
    }

    private boolean refreshProfile(User user, WechatSession session, WechatLoginRequest request) {
        boolean changed = false;
        if (!StringUtils.hasText(user.getWechatUnionid()) && StringUtils.hasText(session.unionid())) {
            user.setWechatUnionid(session.unionid());
            changed = true;
        }
        if (StringUtils.hasText(request.nickname()) && !request.nickname().trim().equals(user.getNickname())) {
            user.setNickname(request.nickname().trim());
            changed = true;
        }
        if (StringUtils.hasText(request.avatarUrl()) && !request.avatarUrl().equals(user.getAvatarUrl())) {
            user.setAvatarUrl(request.avatarUrl());
            changed = true;
        }
        return changed;
    }
}
