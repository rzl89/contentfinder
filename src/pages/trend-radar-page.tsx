import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrendStore } from '@/stores/trend-store';
import { useProjectStore } from '@/stores/project-store';
import {
  BentoTile,
  Button,
  Badge,
  Input,
  Select,
} from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import {
  TrendingUp,
  Search,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Globe2,
  Calendar,
  FileText,
} from 'lucide-react';
import type { Platform } from '@/types';

export const TrendRadarPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    selectedPlatform,
    selectedStatus,
    searchQuery,
    setPlatform,
    setStatus,
    setSearchQuery,
    getFilteredTrends,
    isLiveFeedAvailable,
  } = useTrendStore();

  const { createProject } = useProjectStore();
  const trends = getFilteredTrends();

  const handleCreateFromTrend = (trend: any) => {
    // Pick first relevant category from trend
    const targetCat = trend.categoryRelevance[0] || 'pov-experience';
    createProject(`Trend: ${trend.title}`, targetCat, 'indonesia_natural');

    showToast({
      type: 'success',
      title: 'Proyek Baru Dibuat dari Tren',
      message: `Mengarahkan ke Idea Studio untuk mengeksplorasi format ${trend.title}`,
    });

    navigate('/');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#14141c] via-[#101015] to-[#14141c] border border-white/10 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Trend Radar Studio</h2>
            <p className="text-xs text-zinc-400">
              Observasi pola tren tervalidasi dari TikTok Creative Center, YouTube Culture & Trends, dan Meta Creators.
            </p>
          </div>
        </div>

        {/* Live Feed Transparency Banner */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 mt-4">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5 text-zinc-300">
            <span className="font-semibold text-amber-300 block">
              Prinsip Transparansi Data: Nol Angka Fiktif
            </span>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              {isLiveFeedAvailable
                ? 'Terhubung ke Live API platform.'
                : 'Data live API saat ini belum terhubung. Seluruh entri di bawah diambil langsung dari publikasi resmi platform (Creative Center Q1 Report, Meta Best Practices, YouTube Trends). Fixprom tidak pernah mengarang angka views atau melabeli konten "viral" tanpa bukti terverifikasi.'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-[#111115] border border-white/10">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <div className="w-full md:w-64">
            <Input
              placeholder="Cari tren, format, atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-3.5 h-3.5" />}
            />
          </div>

          <div className="w-40">
            <Select
              value={selectedPlatform}
              onChange={(e) => setPlatform(e.target.value as Platform | 'all')}
              options={[
                { value: 'all', label: 'Semua Platform' },
                { value: 'tiktok', label: 'TikTok' },
                { value: 'youtube_shorts', label: 'YouTube Shorts' },
                { value: 'instagram_reels', label: 'Instagram Reels' },
                { value: 'multi_platform', label: 'Multi-Platform' },
              ]}
            />
          </div>

          <div className="w-44">
            <Select
              value={selectedStatus}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'all', label: 'Semua Status' },
                { value: 'verified_trend', label: 'Verified Trend' },
                { value: 'trend_inspired', label: 'Trend-Inspired' },
                { value: 'evergreen', label: 'Evergreen' },
              ]}
            />
          </div>
        </div>

        <span className="text-xs text-zinc-500 font-mono">
          {trends.length} observasi ditemukan
        </span>
      </div>

      {/* Trend Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trends.map((item) => (
          <BentoTile
            key={item.id}
            className="p-5 border-white/10 hover:border-amber-500/30 flex flex-col justify-between space-y-4 bg-[#111115]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <Badge
                  variant={
                    item.status === 'verified_trend'
                      ? 'emerald'
                      : item.status === 'trend_inspired'
                      ? 'amber'
                      : 'blue'
                  }
                >
                  {item.status.replace(/_/g, ' ').toUpperCase()}
                </Badge>

                <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                  <Globe2 className="w-3 h-3 text-zinc-500" />
                  <span>{item.region}</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Verified Evidence Box */}
              <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1 text-xs">
                <div className="flex items-center justify-between text-zinc-400 text-[10px]">
                  <span className="font-semibold text-amber-300 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Bukti & Sumber Observasi
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.observedAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  {item.evidence}
                </p>
                <div className="pt-1">
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 underline"
                  >
                    <span>Buka Laporan Resmi Vendor</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              {/* Category tags */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-zinc-500">Relevan dengan:</span>
                {item.categoryRelevance.map((catId) => (
                  <span
                    key={catId}
                    className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono border border-white/5"
                  >
                    {catId}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Action */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400 font-mono">{item.format}</span>
              <Button
                variant="primary"
                size="sm"
                icon={<Sparkles className="w-3.5 h-3.5 text-black" />}
                onClick={() => handleCreateFromTrend(item)}
              >
                Buat Ide dari Tren Ini
              </Button>
            </div>
          </BentoTile>
        ))}
      </div>
    </div>
  );
};
