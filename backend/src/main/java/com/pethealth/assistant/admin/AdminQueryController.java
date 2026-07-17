package com.pethealth.assistant.admin;
import java.util.Map;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/admin")
public class AdminQueryController {
    private final AdminQueryService service;
    public AdminQueryController(AdminQueryService service){this.service=service;}
    @GetMapping("/dashboard") public Map<String,Object> dashboard(){return service.dashboard();}
    @GetMapping("/users") public AdminQueryService.PageResult users(@RequestParam(required=false)String keyword,@RequestParam(required=false)String status,@RequestParam(defaultValue="1")int page,@RequestParam(defaultValue="10")int size){return service.users(keyword,status,page,size);}
    @GetMapping("/pets") public AdminQueryService.PageResult pets(@RequestParam(required=false)String keyword,@RequestParam(required=false)String species,@RequestParam(defaultValue="1")int page,@RequestParam(defaultValue="10")int size){return service.pets(keyword,species,page,size);}
    @GetMapping("/families") public AdminQueryService.PageResult families(@RequestParam(required=false)String keyword,@RequestParam(defaultValue="1")int page,@RequestParam(defaultValue="10")int size){return service.families(keyword,page,size);}
}
