export type RiverviewField = {
  id: string;
  name: string;
  hybrid: string;
  plantingDate: string;
  relativeMaturity: number;
  blackLayerGdu: number;
};

export const RIVERVIEW_FIELDS: RiverviewField[] = [
  { id: "3054", name: "Aupperlies", hybrid: "PR102-50RIB", plantingDate: "2026-05-11", relativeMaturity: 102, blackLayerGdu: 2560 },
  { id: "2047", name: "Brad's 40", hybrid: "DKC 98-88 VT4", plantingDate: "2026-05-08", relativeMaturity: 98, blackLayerGdu: 2465 },
  { id: "2012", name: "Leo's", hybrid: "DKC 101-33 SSP", plantingDate: "2026-05-06", relativeMaturity: 101, blackLayerGdu: 2545 },
  { id: "3083", name: "Duane's Place", hybrid: "PR104-60RIB", plantingDate: "2026-05-06", relativeMaturity: 104, blackLayerGdu: 2605 },
  { id: "2020", name: "Stahman's", hybrid: "Preceon 104-60 SSP", plantingDate: "2026-05-06", relativeMaturity: 104, blackLayerGdu: 2605 },
  { id: "1056", name: "Haas 1/4", hybrid: "Preceon 104-60 SSP", plantingDate: "2026-05-06", relativeMaturity: 104, blackLayerGdu: 2605 },
  { id: "2054", name: "Scott 35", hybrid: "DKC 98-88 VT4", plantingDate: "2026-05-08", relativeMaturity: 98, blackLayerGdu: 2465 },
  { id: "2009", name: "Sommer's", hybrid: "DKC 106-98 VT4", plantingDate: "2026-05-08", relativeMaturity: 106, blackLayerGdu: 2655 },
  { id: "4015", name: "Anderson's North", hybrid: "Preceon 102-50 SSP", plantingDate: "2026-05-07", relativeMaturity: 102, blackLayerGdu: 2560 },
  { id: "1014", name: "Roberts", hybrid: "DKC 101-33 SSP", plantingDate: "2026-05-04", relativeMaturity: 101, blackLayerGdu: 2545 },
  { id: "1000", name: "Jim's 80", hybrid: "DKC 106-98 VT4", plantingDate: "2026-05-09", relativeMaturity: 106, blackLayerGdu: 2655 },
  { id: "4008", name: "Nuest's", hybrid: "DKC 106-98 VT4", plantingDate: "2026-05-08", relativeMaturity: 106, blackLayerGdu: 2655 },
  { id: "3039", name: "Lorens", hybrid: "Preceon 107-50 SSP", plantingDate: "2026-05-02", relativeMaturity: 103, blackLayerGdu: 2600 },
  { id: "2072", name: "Bourdage's", hybrid: "DKC 101-33 SSP", plantingDate: "2026-05-05", relativeMaturity: 101, blackLayerGdu: 2545 },
  { id: "2064", name: "2064", hybrid: "DK 106-98 VT4P PB", plantingDate: "2026-05-08", relativeMaturity: 106, blackLayerGdu: 2655 },
  { id: "4018", name: "Maynard's", hybrid: "Preceon 102-50 SSP", plantingDate: "2026-05-07", relativeMaturity: 102, blackLayerGdu: 2560 },
  { id: "4023", name: "Telford's", hybrid: "DKC 101-33 SSP", plantingDate: "2026-05-06", relativeMaturity: 101, blackLayerGdu: 2545 },
  { id: "4000", name: "Cook18", hybrid: "DKC 101-33 SSP", plantingDate: "2026-05-06", relativeMaturity: 101, blackLayerGdu: 2545 },
  { id: "4004", name: "Stahn's", hybrid: "DKC 102-28 TRE", plantingDate: "2026-05-04", relativeMaturity: 102, blackLayerGdu: 2560 },
  { id: "2029", name: "Kevin's Home", hybrid: "PR104-60RIB", plantingDate: "2026-05-06", relativeMaturity: 104, blackLayerGdu: 2605 },
  { id: "1015", name: "Blairs", hybrid: "DKC 101-33 SSP", plantingDate: "2026-05-04", relativeMaturity: 101, blackLayerGdu: 2545 },
  { id: "1006", name: "South of Tyler's", hybrid: "DKC 98-88 VT4", plantingDate: "2026-05-12", relativeMaturity: 98, blackLayerGdu: 2465 },
];

export const CHOP_TARGET_OFFSET_GDU = 300;
