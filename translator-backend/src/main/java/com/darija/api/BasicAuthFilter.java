package com.darija.api;

import jakarta.ws.rs.container.*;
import jakarta.ws.rs.core.*;
import jakarta.ws.rs.ext.Provider;
import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Provider
@Priority(Priorities.AUTHENTICATION)
public class BasicAuthFilter implements ContainerRequestFilter {

    private static final String AUTH_HEADER = "Authorization";
    private static final String AUTH_PREFIX = "Basic ";

    private static final String USER = "darija-client";
    private static final String PASS = "darija-secret";


    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {

        if (USER == null || PASS == null) {
            abort(requestContext);
            return;
        }

        String auth = requestContext.getHeaderString(AUTH_HEADER);

        if (auth == null || !auth.startsWith(AUTH_PREFIX)) {
            abort(requestContext);
            return;
        }

        String base64 = auth.substring(AUTH_PREFIX.length());
        String decoded = new String(
                Base64.getDecoder().decode(base64),
                StandardCharsets.UTF_8
        );

        String[] credentials = decoded.split(":", 2);

        if (credentials.length != 2 ||
                !USER.equals(credentials[0]) ||
                !PASS.equals(credentials[1])) {
            abort(requestContext);
        }
    }

    private void abort(ContainerRequestContext ctx) {
        ctx.abortWith(Response.status(Response.Status.UNAUTHORIZED)
                .header("WWW-Authenticate", "Basic realm=\"Darija Translator API\"")
                .entity("Unauthorized")
                .build());
    }
}