package com.pethealth.assistant.admin;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
@Service
public class AdminQueryService {
    private final JdbcTemplate jdbc;
    public AdminQueryService(JdbcTemplate jdbc){this.jdbc=jdbc;}
    public Map<String,Object> dashboard(){
        Map<String,Object> r=new LinkedHashMap<>();
        r.put("users",count("users","deleted=0")); r.put("pets",count("pets","deleted=0")); r.put("families",count("family_groups","deleted=0"));
        r.put("healthRecords",count("health_records","1=1")); r.put("tasks",count("tasks","deleted=0")); r.put("recognitions",count("recognition_records","1=1"));
        r.put("recentUsers",jdbc.queryForList("SELECT id,nickname,avatar_url,status,created_at FROM users WHERE deleted=0 ORDER BY created_at DESC LIMIT 5"));
        r.put("species",jdbc.queryForList("SELECT species AS name,COUNT(*) AS value FROM pets WHERE deleted=0 GROUP BY species ORDER BY value DESC"));
        r.put("userTrend",jdbc.queryForList("SELECT DATE(created_at) AS day,COUNT(*) AS value FROM users WHERE deleted=0 AND created_at>=CURRENT_DATE-INTERVAL 6 DAY GROUP BY DATE(created_at) ORDER BY day"));
        return r;
    }
    public PageResult users(String keyword,String status,int page,int size){
        String where=" WHERE deleted=0"; List<Object> a=new ArrayList<>();
        if(keyword!=null&&!keyword.isBlank()){where+=" AND (nickname LIKE ? OR phone LIKE ? OR CAST(id AS CHAR) LIKE ?)";String k="%"+keyword.trim()+"%";a.add(k);a.add(k);a.add(k);}
        if(status!=null&&!status.isBlank()){where+=" AND status=?";a.add(status);}
        return page("SELECT id,nickname,avatar_url,phone,status,created_at,updated_at FROM users"+where,"SELECT COUNT(*) FROM users"+where,a,page,size);
    }
    public PageResult pets(String keyword,String species,int page,int size){
        String where=" WHERE p.deleted=0"; List<Object>a=new ArrayList<>();
        if(keyword!=null&&!keyword.isBlank()){where+=" AND (p.name LIKE ? OR p.breed LIKE ?)";String k="%"+keyword.trim()+"%";a.add(k);a.add(k);}
        if(species!=null&&!species.isBlank()){where+=" AND p.species=?";a.add(species);}
        return page("SELECT p.id,p.name,p.species,p.breed,p.gender,p.birth_date,p.weight,p.health_score,p.created_at,f.name AS family_name,u.nickname AS creator_name FROM pets p JOIN family_groups f ON f.id=p.family_id JOIN users u ON u.id=p.created_by"+where,"SELECT COUNT(*) FROM pets p"+where,a,page,size);
    }
    public PageResult families(String keyword,int page,int size){
        String where=" WHERE f.deleted=0";List<Object>a=new ArrayList<>();
        if(keyword!=null&&!keyword.isBlank()){where+=" AND (f.name LIKE ? OR u.nickname LIKE ?)";String k="%"+keyword.trim()+"%";a.add(k);a.add(k);}
        String base=" FROM family_groups f JOIN users u ON u.id=f.owner_user_id LEFT JOIN family_members fm ON fm.family_id=f.id LEFT JOIN pets p ON p.family_id=f.id AND p.deleted=0";
        return page("SELECT f.id,f.name,u.nickname AS owner_name,COUNT(DISTINCT fm.id) AS member_count,COUNT(DISTINCT p.id) AS pet_count,f.created_at"+base+where+" GROUP BY f.id,f.name,u.nickname,f.created_at","SELECT COUNT(DISTINCT f.id)"+base+where,a,page,size);
    }
    private long count(String table,String where){return jdbc.queryForObject("SELECT COUNT(*) FROM "+table+" WHERE "+where,Long.class);}
    private PageResult page(String select,String count,List<Object>a,int page,int size){int p=Math.max(1,page),s=Math.min(100,Math.max(1,size));Long total=jdbc.queryForObject(count,Long.class,a.toArray());List<Object>b=new ArrayList<>(a);b.add(s);b.add((p-1)*s);List<Map<String,Object>> items=jdbc.queryForList(select+" ORDER BY created_at DESC LIMIT ? OFFSET ?",b.toArray());return new PageResult(items,total==null?0:total,p,s);}
    public record PageResult(List<Map<String,Object>> items,long total,int page,int size){}
}
