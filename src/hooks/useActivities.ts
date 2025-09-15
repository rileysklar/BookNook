'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Activity {
  id: string;
  activity_type: 'library_created' | 'library_updated' | 'library_deleted' | 'search_performed' | 'library_viewed' | 'library_rated';
  entity_id?: string;
  entity_type?: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/activities');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Activities API error:', response.status, errorData);
        
        if (response.status === 401) {
          throw new Error('Please sign in to view your activities');
        } else if (response.status === 500) {
          throw new Error('Server error - activities table may not be set up yet');
        } else {
          throw new Error(`Failed to fetch activities: ${errorData.error || response.statusText}`);
        }
      }
      
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching activities:', err);
      
      // Set empty activities array on error to prevent UI issues
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const logSearchActivity = useCallback(async (searchQuery: string, resultsCount: number = 0, coordinates?: [number, number]) => {
    try {
      const response = await fetch('/api/activities/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          search_query: searchQuery,
          results_count: resultsCount,
          coordinates: coordinates
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to log search activity');
      }

      // Refresh activities after logging
      await fetchActivities();
    } catch (err) {
      console.error('Error logging search activity:', err);
    }
  }, [fetchActivities]);

  const logActivity = useCallback(async (activityType: Activity['activity_type'], title: string, description?: string, metadata?: Record<string, any>) => {
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_type: activityType,
          title,
          description,
          metadata
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to log activity');
      }

      // Refresh activities after logging
      await fetchActivities();
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  }, [fetchActivities]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    loading,
    error,
    fetchActivities,
    logSearchActivity,
    logActivity
  };
}
