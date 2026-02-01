package com.darija.api;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

@Path("/translate")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class TranslatorResource {

    // API KEY & URL
    private static final String API_KEY = System.getenv("GEMINI_API_KEY");
    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final Gson gson = new Gson();

    @POST
    public Response translate(Map<String, String> request) {

        if (request == null || !request.containsKey("text") || request.get("text").isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Field 'text' is required"))
                    .build();
        }

        String text = request.get("text");
        String direction = request.getOrDefault("direction", "EN_DA");

        try {
            String translatedText = callGemini(text, direction);
            return Response.ok(Map.of("translatedText", translatedText)).build();

        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @OPTIONS
    public Response preflight() {
        return Response.ok().build();
    }

    // ================= Gemini =================

    private String callGemini(String text, String direction) throws Exception {

        if (API_KEY == null || API_KEY.isBlank()) {
            throw new IllegalStateException("Gemini API key not configured");
        }

        String prompt = buildPrompt(text, direction);

        Map<String, Object> payload = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(GEMINI_URL + API_KEY))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(payload)))
                .build();

        HttpResponse<String> response =
                httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException(
                    "Gemini API Error " + response.statusCode() + ": " + response.body()
            );
        }

        return extractText(response.body());
    }

    // ================= Prompt =================

    private String buildPrompt(String text, String direction) {

        if ("DA_EN".equals(direction)) {
            return """
                Translate the following Moroccan Darija text to English.
                Use natural fluent English.
                Without explain details.
                Text: %s
                """.formatted(text);
        }

        // Default EN → DA
        return """
                Translate the following English text to Moroccan Darija only.
                Use natural everyday spoken language.
                Use Arabic letters.
                Text: %s
                """.formatted(text);
    }

    // ================= Response Parser =================

    private String extractText(String json) {
        JsonObject root = gson.fromJson(json, JsonObject.class);

        return root.getAsJsonArray("candidates")
                .get(0).getAsJsonObject()
                .getAsJsonObject("content")
                .getAsJsonArray("parts")
                .get(0).getAsJsonObject()
                .get("text").getAsString();
    }
}