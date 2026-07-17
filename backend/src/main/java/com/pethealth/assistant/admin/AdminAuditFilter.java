package com.pethealth.assistant.admin;
import jakarta.servlet.*;import jakarta.servlet.http.*;import java.io.IOException;
import org.springframework.jdbc.core.JdbcTemplate;import org.springframework.stereotype.Component;import org.springframework.web.filter.OncePerRequestFilter;
@Component
public class AdminAuditFilter extends OncePerRequestFilter {
    private final JdbcTemplate jdbc; public AdminAuditFilter(JdbcTemplate jdbc){this.jdbc=jdbc;}
    @Override protected boolean shouldNotFilter(HttpServletRequest r){return !r.getRequestURI().startsWith("/api/admin/");}
    @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
        long start=System.currentTimeMillis(); try{chain.doFilter(req,res);}finally{
            String principal=req.getUserPrincipal()==null?null:req.getUserPrincipal().getName(); Long id=null;if(principal!=null&&principal.startsWith("admin:"))id=Long.valueOf(principal.substring(6));
            String username=null;if(id!=null){var names=jdbc.queryForList("SELECT username FROM admin_users WHERE id=?",String.class,id);if(!names.isEmpty())username=names.getFirst();}
            jdbc.update("INSERT INTO admin_audit_logs(admin_user_id,username,action,request_method,request_path,ip_address,user_agent,success,detail) VALUES (?,?,?,?,?,?,?,?,?)",id,username,req.getMethod()+" "+req.getRequestURI(),req.getMethod(),req.getRequestURI(),req.getRemoteAddr(),req.getHeader("User-Agent"),res.getStatus()<400,"status="+res.getStatus()+", durationMs="+(System.currentTimeMillis()-start));
        }
    }
}
