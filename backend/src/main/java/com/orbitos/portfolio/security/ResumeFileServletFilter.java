package com.orbitos.portfolio.security;

import com.orbitos.portfolio.dto.ResumeDto;
import com.orbitos.portfolio.service.domain.ResumeService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Optional;

/**
 * Serves GET /resume-file before the request reaches Spring Security, so the iframe never gets 401.
 */
public class ResumeFileServletFilter extends OncePerRequestFilter {

    private static final String PATH = "/resume-file";
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !"GET".equalsIgnoreCase(request.getMethod()) || !PATH.equals(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        WebApplicationContext ctx = WebApplicationContextUtils.getWebApplicationContext(request.getServletContext());
        if (ctx == null) {
            filterChain.doFilter(request, response);
            return;
        }
        ResumeService resumeService = ctx.getBean(ResumeService.class);
        Optional<ResumeDto> opt = resumeService.getResumeOptional();
        if (opt.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        String viewUrl = opt.get().getViewUrl();
        if (viewUrl == null || viewUrl.isBlank() || viewUrl.contains("example.com")) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        try {
            HttpRequest httpRequest = HttpRequest.newBuilder().uri(URI.create(viewUrl)).GET().build();
            HttpResponse<byte[]> httpResponse = HTTP_CLIENT.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());
            if (httpResponse.statusCode() != 200) {
                response.setStatus(httpResponse.statusCode());
                return;
            }
            byte[] body = httpResponse.body();
            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/pdf");
            response.setHeader("Cache-Control", "private, max-age=300");
            response.setContentLength(body.length);
            response.getOutputStream().write(body);
            response.getOutputStream().flush();
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
