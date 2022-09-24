import type { 
  EmissionsFactorInterface,
  UtilityLookupItemInterface 
} from "@blockchain-carbon-accounting/emissions_data_lib"
import type { 
  OilAndGasAssetInterface,
  ProductInterface 
} from "@blockchain-carbon-accounting/oil-and-gas-data-lib"


export interface EmissionFactorDbInterface {
  putEmissionFactor: (doc: EmissionsFactorInterface) => Promise<void>
  getEmissionFactor: (uuid: string) => Promise<EmissionsFactorInterface | null>
  getEmissionsFactorsByDivision: (divisionID: string, divisionType: string, year?: number) => Promise<EmissionsFactorInterface[]>
  getEmissionsFactors: (query: Partial<EmissionsFactorInterface>) => Promise<EmissionsFactorInterface[]>
  getEmissionsFactorsSimple: (query: Partial<EmissionsFactorInterface>) => Promise<EmissionsFactorInterface[]>
}

export interface UtilityLookupItemDbInterface {
  putUtilityLookupItem: (doc: UtilityLookupItemInterface) => Promise<void>
}

export interface OilAndGasAssetDbInterface {
  putAsset: (doc: OilAndGasAssetInterface) => Promise<void>
  getAsset: (uuid: string) => Promise<OilAndGasAssetInterface | null>
  getAssets: (query: Partial<OilAndGasAssetInterface>) => Promise<OilAndGasAssetInterface[]>
}

export interface ProductDbInterface {
  putProduct: (doc: ProductInterface) => Promise<void>
  getProduct: (uuid: string) => Promise<ProductInterface | null>
  getAllProducts: (query: Partial<ProductInterface>) => Promise<ProductInterface[]>
}

