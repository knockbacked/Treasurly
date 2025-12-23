package com.example.backend.config;
import com.example.backend.models.User;
import com.example.backend.repositories.UserRepository;

import org.springframework.boot.web.servlet.server.CookieSameSiteSupplier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// -----------------------------------------------------------
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final UserRepository userRepository;

    public SecurityConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return email -> {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            return org.springframework.security.core.userdetails.User
                    .withUsername(user.getEmail()) // Spring uses email as username
                    .password(user.getPassword())  // BCrypt hash
                    .roles("USER")
                    .build();
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors()
            .and()
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/hello").permitAll()
                .requestMatchers("/api/hello").permitAll()
                .requestMatchers("/api/users/**").permitAll()
                .requestMatchers("/api/finance/**").permitAll()
                .requestMatchers("/api/categories/**").permitAll()
                .requestMatchers("/api/transactions/**").permitAll()
                .requestMatchers("/api/budgets/**").permitAll()
                .requestMatchers("/api/analytics/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()


                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .usernameParameter("email") // read email field instead of username
            );

        return http.build();
    }


    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:5173")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowCredentials(true)
                        .allowedHeaders("*")
                        .exposedHeaders("Set-Cookie");
            }
        };
    }


    @Configuration
    public class CookieConfig {
        @Bean
        public CookieSameSiteSupplier applicationCookieSameSiteSupplier() {
            // ✅ Ensures Chrome will send JSESSIONID on cross-origin requests
            return CookieSameSiteSupplier.ofNone();
        }
    }

}