package com.edu.tlgz.controller;

import com.edu.tlgz.model.ApiResponse;
import com.edu.tlgz.model.LiveStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

// 标识这是一个控制器，处理HTTP请求
@RestController
// 接口路径前缀：所有接口都以/api开头
@RequestMapping("/api")
// 解决跨域问题（让前端能调用接口）
@CrossOrigin
public class LiveStatusController {
    // 定义接口：GET请求 /api/live-status
    @GetMapping("/live-status")
    public ApiResponse getLiveStatus(
            // 接收前端传的ids参数（可选，比如?ids=123,456）
            @RequestParam(required = false) String ids
    ) {
        try {
            // 1. 处理参数：把ids拆分成数组（比如"123,456"→["123","456"]）
            List<String> idList = ids == null ? List.of() : Arrays.asList(ids.split(","));

            // 2. 模拟从数据库查询直播状态（随机返回live/idle）
            List<LiveStatus> liveStatusList = idList.stream()
                    .map(id -> {
                        // 随机生成状态：30%概率live，70%概率idle
                        String status = new Random().nextDouble() > 0.7 ? "live" : "idle";
                        return new LiveStatus(id, status);
                    })
                    .collect(Collectors.toList());

            // 3. 返回结果（按要求包含list数组）
            return new ApiResponse(200, "success", liveStatusList);
        } catch (Exception e) {
            // 出错时返回空列表
            return new ApiResponse(500, "服务器错误", List.of());
        }
    }
}
