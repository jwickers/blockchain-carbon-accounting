import { TRPCClientError } from '@trpc/client';
import axios from 'axios';
import { SetStateAction } from 'react';
import type { QueryBundle, Operator } from '@blockchain-carbon-accounting/data-postgres';
//import type { OilAndGasAssetInterface } from "@blockchain-carbon-accounting/oil-and-gas-data-lib";
import { BASE_URL } from './api.config';
import { trpcClient } from './trpc'

axios.defaults.baseURL = BASE_URL;

function handleError(error: unknown, prefix: string) {
    const response = (error as any).response ?? error
    const data_error = response?.data?.error ?? response?.error ?? response?.data ?? response
    console.error('Error response has data?:', data_error)
    let errMsg = prefix
    if (data_error) {
        if (data_error.name === 'ApplicationError' || data_error.message) {
            errMsg += ': ' + data_error.message
        } else {
            errMsg += `:\n ${JSON.stringify(data_error,null,2)}`

        }
    }
    console.error(`handleError: ${prefix} -->`, errMsg)
    return errMsg;
}


export function handleFormErrors<F extends {}, E extends {}>(err: unknown, setFormErrors: (e: SetStateAction<E>) => void, setForm: (f: SetStateAction<F>) => void) {
  console.error(err)
  if (err instanceof TRPCClientError) {
    console.warn(err.data, err.message)
    let topLevelError = err?.data?.domainError
    if (err?.data?.zodError?.fieldErrors) {
      const fieldErrors = err.data.zodError.fieldErrors
      const errs: Partial<Record<keyof E, string>> = {};
      for (const f in fieldErrors) {
        errs[f as keyof E] = fieldErrors[f].join(', ')
      }
      setFormErrors(e=>{ return { ...e, ...errs} })
    } else if (err?.data?.domainErrorPath) {
      const errs: Partial<Record<keyof E, string>> = {};
      errs[err?.data?.domainErrorPath as keyof E] = err?.data?.domainError
      console.warn('Set field errors', errs)
      // here no need to repeat as toplevel error
      topLevelError = ''
      setFormErrors(e=>{ return { ...e, ...errs} })
    } else if (!topLevelError) {
      topLevelError = err?.message || 'An unexpected error occurred'
    }
    setForm(f=>{ return { ...f, loading: '', error: topLevelError } })
  } else {
    setForm(f=>{ return { ...f, loading: '', error: ("" + ((err as any)?.message || err) as any) } })
  }
}


function buildBundlesFromQueries(query: string[]) {
    let bundles: QueryBundle[] = []
    query.forEach(elem => {
        const elems = elem.split(',')
        bundles.push({
            field: elems[0],
            fieldType: elems[1],
            value: elems[2],
            op: elems[3],
        })
    });
    return bundles
}

export const getOperators = async (offset: number, limit: number, query: string[]): Promise<{count:number, operators:Operator[], status:string}> => {
    try {
        const bundles = buildBundlesFromQueries(query)
        console.info('getOperators:', offset, limit, bundles)
        const { status, count, operators, error } = await trpcClient.query('asset.listOperators', {offset, limit, bundles})
        if (status === 'success' && operators) {
            return { count, operators, status }
        } else {
            if (status !== 'success') console.error('getOperators error:', error)
            return {count: 0, operators: [], status};
        }
    } catch(error) {
        throw new Error(handleError(error, "Cannot get operators"))
    }
}