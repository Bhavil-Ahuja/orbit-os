package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.ResumeDto;
import com.orbitos.portfolio.service.domain.ResumeService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Optional;

/**
 * Serves the resume PDF at /resume-file and /Bhavil_Ahuja_Resume.pdf (root path, no /api).
 * The .pdf path is used for the iframe so the browser PDF viewer shows "Bhavil_Ahuja_Resume.pdf".
 */
@RestController
public class ResumeFileController {

    private static final String RESUME_PDF_FILENAME = "Bhavil_Ahuja_Resume.pdf";

    private final ResumeService resumeService;
    private final HttpClient httpClient = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build();

    public ResumeFileController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @GetMapping(value = "/resume-file", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getResumeFile() {
        return serveResumePdf();
    }

    @GetMapping(value = "/" + RESUME_PDF_FILENAME, produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getResumePdfNamed() {
        return serveResumePdf();
    }

    private ResponseEntity<byte[]> serveResumePdf() {
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
                if (response.statusCode() == 404 || response.statusCode() == 410) {
                    resumeService.clearUrlsIfUnreachable();
                }
                return ResponseEntity.status(response.statusCode())
                        .header("Cache-Control", "no-store, must-revalidate")
                        .build();
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header("Cache-Control", "no-store, must-revalidate")
                    .body(response.body());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
