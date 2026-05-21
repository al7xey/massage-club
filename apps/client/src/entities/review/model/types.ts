export interface ReviewCardModel {
  id: string;
  author: string;
  role: string;
  text: string;
  date: string;
  rating: number;
}

export interface ReviewDto {
  id: string;
  rating: number;
  comment?: string | null;
  isPublished: boolean;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
  };
  service?: {
    id: string;
    title: string;
  } | null;
}

export interface CreateReviewPayload {
  comment?: string;
  rating: number;
  serviceId?: string;
}
