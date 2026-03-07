package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.ResumeDto;
import com.orbitos.portfolio.service.domain.ResumeService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Optional;

@RestController
@RequestMapping("/api/public/resume")
public class ResumePublicController {

    private final ResumeService resumeService;
    private final HttpClient httpClient = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build();

    public ResumePublicController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @GetMapping
    public ResponseEntity<ResumeDto> getResume() {
        return ResponseEntity.ok(resumeService.getResume());
    }

    /**
     * Proxies the resume PDF from the stored view URL so the frontend can embed it in an iframe
     * without Cloudinary CORS/X-Frame-Options blocking.
     */
    @GetMapping(value = "/file", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getResumeFile() {
        Optional<ResumeDto> opt = resumeService.getResumeOptional();
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        String viewUrl = opt.get().getViewUrl();
        if (viewUrl == null || viewUrl.isBlank() || viewUrl.contains("example.com")) {
            return ResponseEntity.notFound().build();
        }
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(viewUrl))
                    .GET()
                    .build();
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() != 200) {
                return ResponseEntity.status(response.statusCode()).build();
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header("Cache-Control", "private, max-age=300")
                    .body(response.body());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
