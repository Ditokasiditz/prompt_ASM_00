'use client'

import React, { useEffect, useState } from "react"
import { RefreshCw, Globe, MapPin, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react"
import { WorldMap } from "@/components/world-map"
import { cn } from "@/lib/utils"

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100]
import { API_BASE } from "@/lib/api"

interface Asset {
  id: number
  hostname: string
  ipAddress: string | null
  type: string
  isExposed: boolean
  city: string | null
  country: string | null
  countryCode: string | null
  latitude: number | null
  longitude: number | null
  discoveredAt: string
  _count: {
    issues: number
  }
}

export default function DigitalFootprintPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")

  // Reset to page 1 whenever pageSize or searchQuery changes
  useEffect(() => {
    setCurrentPage(1)
  }, [pageSize, searchQuery])

  const fetchAssets = async (fullSync: boolean = false) => {
    setLoading(true)
    try {
      if (fullSync) {
        // Trigger backend to scan all assets from Shodan
        await fetch(`${API_BASE}/api/assets/refresh-all`, { method: 'POST' })
      }
      
      const res = await fetch(`${API_BASE}/api/assets`)
      const data = await res.json()
      setAssets(data)
    } catch (error) {
      console.error('Error fetching/syncing assets', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  const filteredAssets = assets.filter(asset => 
    asset.hostname.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (asset.ipAddress && asset.ipAddress.includes(searchQuery))
  )

  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, filteredAssets.length)
  const paginatedAssets = filteredAssets.slice(startIndex, endIndex)

  const handleRefresh = async (id: number) => {
    setRefreshing(id)
    try {
      const response = await fetch(`${API_BASE}/api/assets/${id}/refresh`, {
        method: 'POST',
      })
      if (response.ok) {
        // Update local state or re-fetch
        fetchAssets()
      } else {
        const err = await response.json()
        alert(err.error || 'Failed to refresh asset')
      }
    } catch (error) {
      console.error('Error refreshing asset', error)
    } finally {
      setRefreshing(null)
    }
  }


  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 relative bg-gradient-to-br from-[#050B35] via-[#0B1247] to-[#1a188b]">
          {/* Abstract Background Elements */}
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#1a188b]/40 blur-[120px] rounded-full pointer-events-none" />

          <div className="mx-auto max-w-6xl space-y-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Global Asset Inventory</span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">Digital Footprint</h1>
                <p className="text-white/60 mt-2 max-w-2xl">
                  Visualize and manage your external-facing assets across the globe. Powered by Shodan intelligence.
                </p>
              </div>
              <button 
                onClick={() => fetchAssets(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 text-sm font-medium transition-all"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                Sync Data
              </button>
            </div>

            {/* Map Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white/90 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-500" />
                  Asset Geolocation
                </h2>
              </div>
              <WorldMap locations={assets} />
            </div>

            {/* Table Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-white/90">Infrastructure Details</h2>
                {/* Search / Filter */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search hostname or IP..."
                    className="pl-9 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white/80 placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
                  />
                </div>
              </div>
              <div className="bg-[#0B1247]/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/5">
                        <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">Hostname</th>
                        <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">IP Address</th>
                        <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider text-center">Issues</th>
                        <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loading && assets.length === 0 ? (
                         <tr>
                           <td colSpan={5} className="px-6 py-12 text-center text-white/40 italic">
                             Loading asset footprint...
                           </td>
                         </tr>
                      ) : assets.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-white/40 italic">
                            No assets mapped yet. Add assets to see them here.
                          </td>
                        </tr>
                      ) : (
                        paginatedAssets.map((asset) => (
                          <tr key={asset.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-semibold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight text-sm">{asset.hostname}</span>
                                <span className="text-[10px] text-white/30 font-mono">{asset.type}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-white/70 font-mono">{asset.ipAddress || 'N/A'}</span>
                            </td>
                            <td className="px-6 py-4">
                              {asset.city ? (
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "text-sm",
                                    asset.city === 'Not Found' ? "text-white/40 italic" : "text-white/80"
                                  )}>
                                    {asset.city}{asset.country ? `, ${asset.country}` : ''}
                                  </span>
                                  {asset.countryCode && (
                                    <img 
                                      src={`https://flagcdn.com/w20/${asset.countryCode.toLowerCase()}.png`} 
                                      alt={asset.countryCode}
                                      className="w-4 h-auto opacity-80"
                                    />
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-white/20 italic">Not scanned</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={cn(
                                "inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full text-xs font-bold",
                                asset._count.issues > 0 ? "bg-red-500/20 text-red-500 border border-red-500/30" : "bg-green-500/10 text-green-500/70"
                              )}>
                                {asset._count.issues}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleRefresh(asset.id)}
                                disabled={refreshing === asset.id}
                                className={cn(
                                  "p-2 rounded-lg transition-all",
                                  refreshing === asset.id ? "bg-blue-500/20 text-blue-400" : "hover:bg-white/10 text-white/40 hover:text-white"
                                )}
                                title={asset.ipAddress ? "Refresh via Shodan Host API" : "Resolve IP via Shodan DNS, then enrich"}
                              >
                                <RefreshCw className={cn("w-4 h-4", refreshing === asset.id && "animate-spin")} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ── Pagination footer ── */}
                {!loading && assets.length > 0 && (
                  <div className="px-5 py-3 border-t border-white/5 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-3">

                    {/* Left: rows per page */}
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span>Rows per page:</span>
                      <div className="relative">
                        <select
                          id="page-size-select"
                          value={pageSize}
                          onChange={e => setPageSize(Number(e.target.value))}
                          className={cn(
                            'appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs font-semibold text-white/70',
                            'bg-white/5 border border-white/10 hover:bg-white/10',
                            'focus:outline-none focus:ring-1 focus:ring-blue-500/40 cursor-pointer transition-all'
                          )}
                        >
                          {PAGE_SIZE_OPTIONS.map(n => (
                            <option key={n} value={n} className="bg-[#0B1247] text-white">
                              {n}
                            </option>
                          ))}
                        </select>
                        <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 rotate-90 pointer-events-none" />
                      </div>
                    </div>

                    {/* Centre: range label */}
                    <span className="text-xs text-white/50 font-mono select-none">
                      {filteredAssets.length === 0
                        ? '0 results'
                        : `${startIndex + 1}–${endIndex} of ${filteredAssets.length}`}
                    </span>

                    {/* Right: page navigation */}
                    <div className="flex items-center gap-1">
                      {/* First page */}
                      <button
                        id="page-first-btn"
                        onClick={() => setCurrentPage(1)}
                        disabled={safePage === 1}
                        className={cn(
                          'p-1.5 rounded-lg transition-all',
                          safePage === 1
                            ? 'text-white/15 cursor-not-allowed'
                            : 'text-white/40 hover:text-white hover:bg-white/10'
                        )}
                        title="First page"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </button>

                      {/* Prev page */}
                      <button
                        id="page-prev-btn"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                        className={cn(
                          'p-1.5 rounded-lg transition-all',
                          safePage === 1
                            ? 'text-white/15 cursor-not-allowed'
                            : 'text-white/40 hover:text-white hover:bg-white/10'
                        )}
                        title="Previous page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Page number pills */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                        .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                          if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('ellipsis')
                          acc.push(p)
                          return acc
                        }, [])
                        .map((item, i) =>
                          item === 'ellipsis' ? (
                            <span key={`ellipsis-${i}`} className="px-1 text-white/20 text-xs select-none">
                              …
                            </span>
                          ) : (
                            <button
                              key={item}
                              onClick={() => setCurrentPage(item as number)}
                              className={cn(
                                'min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-semibold transition-all',
                                item === safePage
                                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                                  : 'text-white/40 hover:text-white hover:bg-white/10'
                              )}
                            >
                              {item}
                            </button>
                          )
                        )}

                      {/* Next page */}
                      <button
                        id="page-next-btn"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                        className={cn(
                          'p-1.5 rounded-lg transition-all',
                          safePage === totalPages
                            ? 'text-white/15 cursor-not-allowed'
                            : 'text-white/40 hover:text-white hover:bg-white/10'
                        )}
                        title="Next page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Last page */}
                      <button
                        id="page-last-btn"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={safePage === totalPages}
                        className={cn(
                          'p-1.5 rounded-lg transition-all',
                          safePage === totalPages
                            ? 'text-white/15 cursor-not-allowed'
                            : 'text-white/40 hover:text-white hover:bg-white/10'
                        )}
                        title="Last page"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
    </main>
  )
}
