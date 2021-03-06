/* eslint-disable no-await-in-loop */
import { useState, useEffect } from 'react'
import { request, gql } from 'graphql-request'
import { INFO_CLIENT } from 'config/constants/endpoints'
import { ADE_FINANCE_START } from 'config/constants/info'
import { ChartEntry } from 'state/info/types'
import { AdeDayDatasResponse } from '../types'
import { fetchChartData, mapDayData } from '../helpers'

/**
 * Data for displaying Liquidity and Volume charts on Overview page
 */
const ADE_DAY_DATAS = gql`
  query overviewCharts($startTime: Int!, $skip: Int!) {
    adeDayDatas(first: 1000, skip: $skip, where: { date_gt: $startTime }, orderBy: date, orderDirection: asc) {
      date
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }
`

const getOverviewChartData = async (skip: number): Promise<{ data?: ChartEntry[]; error: boolean }> => {
  try {
    const { adeDayDatas } = await request<AdeDayDatasResponse>(INFO_CLIENT, ADE_DAY_DATAS, {
      startTime: ADE_FINANCE_START,
      skip,
    })
    const data = adeDayDatas.map(mapDayData)
    return { data, error: false }
  } catch (error) {
    console.error('Failed to fetch overview chart data', error)
    return { error: true }
  }
}

/**
 * Fetch historic chart data
 */
const useFetchGlobalChartData = (): {
  error: boolean
  data: ChartEntry[] | undefined
} => {
  const [overviewChartData, setOverviewChartData] = useState<ChartEntry[] | undefined>()
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await fetchChartData(getOverviewChartData)
      if (data) {
        setOverviewChartData(data)
      } else {
        setError(true)
      }
    }
    if (!overviewChartData && !error) {
      fetch()
    }
  }, [overviewChartData, error])

  return {
    error,
    data: overviewChartData,
  }
}

export default useFetchGlobalChartData
