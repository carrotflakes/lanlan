// API service for chat, translation, and annotation functionality

export interface ChatMessage {
  role: string;
  parts: string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  nativeLanguage: string;
  learningLanguage: string;
}

export interface ChatResponse {
  response: string;
}

export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationResponse {
  translatedText: string;
}

export interface AnnotationRequest {
  text: string;
  language: string;
  explanationLanguage: string;
}

export interface Annotation {
  word: string;
  explanation: string;
}

export interface AnnotationResponse {
  annotations: Annotation[];
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  url: string,
  body: unknown,
  errorMessage: string
): Promise<T> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(errorMessage, error);
    throw new Error(errorMessage);
  }
}

export const chatApi = {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return apiRequest<ChatResponse>(
      "/api/chat",
      request,
      "Error sending message to chat API"
    );
  },
};

export const translationApi = {
  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    return apiRequest<TranslationResponse>(
      "/api/translate",
      request,
      "Error translating text"
    );
  },
};

export const annotationApi = {
  async getAnnotations(request: AnnotationRequest): Promise<AnnotationResponse> {
    return apiRequest<AnnotationResponse>(
      "/api/annotation",
      request,
      "Error fetching annotations"
    );
  },
};

// Convenience functions with common error handling patterns
export const apiService = {
  chat: chatApi,
  translation: translationApi,
  annotation: annotationApi,

  // Helper to handle API errors consistently
  handleApiError(error: unknown, fallbackMessage: string): string {
    if (error instanceof ApiError) {
      return `API Error (${error.status}): ${error.message}`;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return fallbackMessage;
  },
};