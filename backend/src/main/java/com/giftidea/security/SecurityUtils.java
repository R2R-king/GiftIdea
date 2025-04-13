package com.giftidea.security;

import com.giftidea.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("securityUtils")
public class SecurityUtils {
    
    /**
     * Check if the authenticated user is the same as the user with the given ID
     * 
     * @param userId the ID of the user to check against
     * @return true if the authenticated user has the same ID or is an admin
     */
    public boolean isCurrentUser(Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User currentUser = (User) authentication.getPrincipal();
            return currentUser.getId().equals(userId);
        }
        return false;
    }
    
    /**
     * Get the currently authenticated user
     * 
     * @return the authenticated user or null if not authenticated
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        return null;
    }
    
    /**
     * Check if the current user has the specified role
     * 
     * @param roleName the role name to check
     * @return true if the user has the role
     */
    public boolean hasRole(String roleName) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && 
               authentication.getAuthorities().stream()
                   .anyMatch(authority -> authority.getAuthority().equals(roleName));
    }
} 