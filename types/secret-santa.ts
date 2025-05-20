export interface SecretSantaGroup {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  status: 'active' | 'distributed' | 'completed';
  participants: Participant[];
  distribution?: Distribution;
}

export interface Participant {
  id: string;
  name: string;
  email?: string;
  wishlist?: string;
  joinedAt: Date;
}

export interface Distribution {
  pairs: DistributionPair[];
  distributedAt: Date;
}

export interface DistributionPair {
  santaId: string;
  recipientId: string;
} 