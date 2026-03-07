package com.orbitos.portfolio.service.domain;

import com.orbitos.portfolio.dto.ResumeTerminalDto;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Extracts text from a resume PDF and maps it to {@link ResumeTerminalDto}
 * (name, title, sections with lines) for terminal-style display.
 */
@Component
public class PdfToTerminalParser {

    /** Section headers often look like: EXPERIENCE, Education, Technical Skills, etc. */
    private static final Pattern LIKELY_SECTION_HEADER = Pattern.compile(
            "^(?:[A-Z][A-Z\\s]{2,40}|[A-Z][a-z]+(?:\\s+[A-Z][a-z]+){0,4})$"
    );
    private static final int MAX_HEADER_LENGTH = 50;

    /** Prefer this when you have bytes (e.g. from MultipartFile.getBytes()) to avoid stream consumption issues. */
    public ResumeTerminalDto parse(byte[] pdfBytes) throws IOException {
        try (PDDocument doc = Loader.loadPDF(pdfBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String raw = stripper.getText(doc);
            return parseRawText(raw);
        }
    }

    public ResumeTerminalDto parse(InputStream pdfInput) throws IOException {
        return parse(pdfInput.readAllBytes());
    }

    ResumeTerminalDto parseRawText(String raw) {
        if (raw == null || raw.isBlank()) {
            return ResumeTerminalDto.builder()
                    .name("")
                    .title("")
                    .sections(List.of())
                    .build();
        }
        String[] lines = raw.lines()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);

        String name = lines.length > 0 ? lines[0] : "";
        String title = lines.length > 1 && lines[1].length() < 80 && !looksLikeBulletOrDate(lines[1])
                ? lines[1] : "";
        List<ResumeTerminalDto.SectionDto> sections = new ArrayList<>();
        List<String> currentLines = new ArrayList<>();
        String currentSectionTitle = null;
        int start = title.isEmpty() ? 1 : 2;

        for (int i = start; i < lines.length; i++) {
            String line = lines[i];
            if (looksLikeSectionHeader(line)) {
                if (currentSectionTitle != null) {
                    sections.add(ResumeTerminalDto.SectionDto.builder()
                            .title(currentSectionTitle)
                            .lines(new ArrayList<>(currentLines))
                            .build());
                    currentLines.clear();
                }
                currentSectionTitle = line;
                continue;
            }
            if (currentSectionTitle != null) {
                currentLines.add(line);
            } else {
                currentSectionTitle = "Summary";
                currentLines.add(line);
            }
        }
        if (currentSectionTitle != null) {
            sections.add(ResumeTerminalDto.SectionDto.builder()
                    .title(currentSectionTitle)
                    .lines(new ArrayList<>(currentLines))
                    .build());
        }
        return ResumeTerminalDto.builder()
                .name(name)
                .title(title)
                .sections(sections)
                .build();
    }

    private static boolean looksLikeBulletOrDate(String line) {
        return line.startsWith("•") || line.startsWith("-") || line.matches(".*\\d{4}.*");
    }

    private static boolean looksLikeSectionHeader(String line) {
        if (line.length() > MAX_HEADER_LENGTH) return false;
        if (line.length() < 2) return false;
        if (line.startsWith("•") || line.startsWith("-") || line.matches("^\\d+\\.?\\s.*")) return false;
        if (LIKELY_SECTION_HEADER.matcher(line).matches()) return true;
        return line.equals(line.toUpperCase()) && line.length() <= 25;
    }
}
