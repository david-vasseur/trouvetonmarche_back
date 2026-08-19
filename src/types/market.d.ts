import type { JSONContent } from "@tiptap/core";

export type Market = {
	id: number;
	name: string;

	// Localisation
	address?: string | null;
	zip?: string | null;

	city: string;
	cityCode: string;

	department: string;
	departmentCode: string;

	region: string;
	regionCode: string;

	latitude?: number | null;
	longitude?: number | null;

	// Événement
	startAt: string;
	endAt: string;
	recurrence: Recurrence;
	recurrenceEndAt: string | null;

	// Informations
	history: number;
	visitors?: number | null;

	// Tarifs
	price?: number | null;
	standPrice?: number | null;

	// Contenu
	image?: string | null;
	excerpt?: string | null;
	description?: JSONContent;
	externalUrl?: string | null;
	marketType: MarketType;

	// Informations exposants
	exhibitors?: number | null;
	registrationsOpen: boolean;
	standSizes: string[];
	electricity: ElectricityOption;
	barnum: BarnumRequirement;
	parkingAvailability: ParkingAvailability;
	parkingFree: boolean;

	// Statistiques
	views: number;

	// Catégorie
	category: Category;

	// Relations
	tags: string[];
	openingHours?: MarketOpeningHour[];
	promotions?: Promotion[];

	// Timestamps
	createdAt: string;
	updatedAt: string;
};

export type Recurrence =
  | "NONE"
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "YEARLY";

export type MarketType =
  | "COVERED"
  | "EXTERIOR"
  | "BOTH";

export type ElectricityOption =
  | "NONE"
  | "INCLUDED"
  | "PAID";

export type BarnumRequirement =
  | "REQUIRED"
  | "FORBIDDEN"
  | "OPTIONAL";

export type ParkingAvailability =
  | "NEARBY"
  | "FAR"
  | "NONE";

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type MarketOpeningHour = {
  id: number;
  date: string;
  openAt: string;
  closeAt: string;
};

export type Promotion = {
  id: number;
  startAt: string;
  endAt: string;

  targetType:
    | "FRANCE"
    | "REGION"
    | "DEPARTMENT"
    | "CITY"
    | "RADIUS";

  regionCode?: string | null;
  departmentCode?: string | null;
  cityCode?: string | null;

  latitude?: number | null;
  longitude?: number | null;
  radiusKm?: number | null;
};