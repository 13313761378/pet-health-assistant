package com.pethealth.assistant;

import com.pethealth.assistant.config.JwtProperties;
import com.pethealth.assistant.config.MinioProperties;
import com.pethealth.assistant.config.WechatProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@EnableConfigurationProperties({JwtProperties.class, MinioProperties.class, WechatProperties.class})
public class PetHealthAssistantApplication {

    public static void main(String[] args) {
        SpringApplication.run(PetHealthAssistantApplication.class, args);
    }
}
