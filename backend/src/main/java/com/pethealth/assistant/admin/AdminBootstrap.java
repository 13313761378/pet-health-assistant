package com.pethealth.assistant.admin;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
@Component
public class AdminBootstrap implements ApplicationRunner {
    private final JdbcTemplate jdbc; private final PasswordEncoder encoder; private final String username; private final String password;
    public AdminBootstrap(JdbcTemplate jdbc,PasswordEncoder encoder,@Value("${app.admin.initial-username:admin}") String username,@Value("${app.admin.initial-password:}") String password){this.jdbc=jdbc;this.encoder=encoder;this.username=username;this.password=password;}
    @Override @Transactional public void run(ApplicationArguments args){
        if(password==null||password.isBlank()) return;
        Integer count=jdbc.queryForObject("SELECT COUNT(*) FROM admin_users",Integer.class);
        if(count!=null&&count==0){
            jdbc.update("INSERT INTO admin_users(username,password_hash,display_name) VALUES (?,?,?)",username,encoder.encode(password),"系统管理员");
            Long id=jdbc.queryForObject("SELECT id FROM admin_users WHERE username=?",Long.class,username);
            jdbc.update("INSERT INTO admin_user_roles(admin_user_id,role_id) SELECT ?,id FROM admin_roles WHERE code='ADMIN'",id);
        }
    }
}
