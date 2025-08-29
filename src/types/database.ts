// Database schema types based on BookNook playbook
// These will be generated from Supabase schema once implemented

export interface User {
  id: string
  username: string
  display_name?: string
  avatar_url?: string
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Library {
  id: string
  creator_id: string
  name: string
  description?: string
  coordinates: string // PostGIS POINT format: "(-97.769,30.2669)"
  is_public: boolean
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  updated_at: string
}

export interface Book {
  id: string
  library_id: string
  contributor_id: string
  title: string
  author?: string
  isbn?: string
  genre?: string
  condition_rating?: number // 1-5
  ai_metadata?: Record<string, any>
  photo_urls: string[]
  status: 'available' | 'borrowed' | 'removed'
  created_at: string
  updated_at: string
}

export interface Rating {
  id: string
  user_id: string
  book_id?: string
  library_id?: string
  book_rating?: number // 1-5
  library_rating?: number // 1-5
  comment?: string
  created_at: string
  updated_at: string
}

export interface SearchIndex {
  id: string
  entity_type: 'book' | 'library'
  entity_id: string
  search_vector?: string
  location?: [number, number]
  metadata?: Record<string, any>
  last_indexed: string
}

// Database helper types
export type Tables = {
  users: User
  libraries: Library
  books: Book
  ratings: Rating
  search_index: SearchIndex
}

export type InsertTables = {
  users: Omit<User, 'id' | 'created_at' | 'updated_at'>
  libraries: Omit<Library, 'id' | 'created_at' | 'updated_at'>
  books: Omit<Book, 'id' | 'created_at' | 'updated_at'>
  ratings: Omit<Rating, 'id' | 'created_at' | 'updated_at'>
  search_index: Omit<SearchIndex, 'id' | 'last_indexed'>
}

export type UpdateTables = {
  users: Partial<Omit<User, 'id' | 'created_at'>>
  libraries: Partial<Omit<Library, 'id' | 'created_at'>>
  books: Partial<Omit<Book, 'id' | 'created_at'>>
  ratings: Partial<Omit<Rating, 'id' | 'created_at'>>
  search_index: Partial<Omit<SearchIndex, 'id'>>
}
