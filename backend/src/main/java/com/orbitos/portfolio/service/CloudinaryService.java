package com.orbitos.portfolio.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

@Service
public class CloudinaryService {

    private static final String RESUME_FOLDER = "resume";

    private final Cloudinary cloudinary;

    @Autowired(required = false)
    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Uploads a file (e.g. PDF) to Cloudinary as raw resource and returns the secure URL.
     * Requires Cloudinary to be configured (cloud_name, api_key, api_secret).
     */
    @SuppressWarnings("unchecked")
    public String uploadRaw(MultipartFile file) throws IOException {
        if (cloudinary == null) {
            throw new IllegalStateException("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.");
        }
        Map<String, Object> options = ObjectUtils.asMap(
                "resource_type", "raw",
                "folder", RESUME_FOLDER,
                "use_filename", true,
                "unique_filename", true
        );
        Path temp = Files.createTempFile("resume-", "-" + (file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload.pdf"));
        try {
            file.transferTo(temp.toFile());
            Map<?, ?> result = cloudinary.uploader().upload(temp.toFile(), options);
            Object url = result.get("secure_url");
            if (url == null) {
                url = result.get("url");
            }
            if (url == null) {
                throw new IllegalStateException("Cloudinary upload did not return a URL");
            }
            return url.toString();
        } finally {
            Files.deleteIfExists(temp);
        }
    }
}
