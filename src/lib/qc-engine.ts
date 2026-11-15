import type { Scene, QCResult, QCIssue, QCStatus } from '@/types';
import { getModelCapability } from './model-catalog';

interface QCValidationOptions {
  scenes: Scene[];
  expectedSceneCount?: number;
  targetModelId?: string;
}

export function runQualityControl(options: QCValidationOptions): QCResult {
  const { scenes, expectedSceneCount, targetModelId = 'universal-neutral' } = options;
  const issues: QCIssue[] = [];

  // Check 1: Scene Count exact match
  if (expectedSceneCount && scenes.length !== expectedSceneCount) {
    issues.push({
      field: 'sceneCount',
      severity: 'FAIL',
      message: `Jumlah adegan (${scenes.length}) tidak sesuai target storyboard yang diminta (${expectedSceneCount}).`,
      suggestion: `Tambahkan atau pangkas adegan hingga tepat ${expectedSceneCount} scene.`,
    });
  }

  // Check 2: Sequential numbering and no duplicates
  const seenNumbers = new Set<number>();
  scenes.forEach((scene, index) => {
    const expectedNum = index + 1;
    if (scene.sceneNumber !== expectedNum) {
      issues.push({
        field: `scenes[${index}].sceneNumber`,
        severity: 'REVIEW',
        message: `Nomor adegan (${scene.sceneNumber}) tidak berurutan (ekspektasi: ${expectedNum}).`,
        suggestion: `Urutkan nomor scene secara bertahap mulai dari 1.`,
      });
    }
    if (seenNumbers.has(scene.sceneNumber)) {
      issues.push({
        field: `scenes[${index}].duplicate`,
        severity: 'FAIL',
        message: `Ditemukan nomor adegan duplikat: ${scene.sceneNumber}.`,
        suggestion: `Pastikan setiap adegan memiliki nomor unik.`,
      });
    }
    seenNumbers.add(scene.sceneNumber);

    // Check 3: Mandatory fields
    if (!scene.beatTitle?.trim()) {
      issues.push({
        field: `scenes[${index}].beatTitle`,
        severity: 'FAIL',
        message: `Adegan ${scene.sceneNumber}: Beat title tidak boleh kosong.`,
      });
    }
    if (!scene.summary?.trim()) {
      issues.push({
        field: `scenes[${index}].summary`,
        severity: 'FAIL',
        message: `Adegan ${scene.sceneNumber}: Summary cerita tidak boleh kosong.`,
      });
    }
    if (!scene.imagePrompt?.trim()) {
      issues.push({
        field: `scenes[${index}].imagePrompt`,
        severity: 'FAIL',
        message: `Adegan ${scene.sceneNumber}: Image prompt tidak boleh kosong.`,
      });
    }
    if (!scene.videoPrompt?.trim()) {
      issues.push({
        field: `scenes[${index}].videoPrompt`,
        severity: 'FAIL',
        message: `Adegan ${scene.sceneNumber}: Video prompt tidak boleh kosong.`,
      });
    }

    // Check 4: Location clarity
    if (!scene.location?.description?.trim() || !scene.location?.environmentType) {
      issues.push({
        field: `scenes[${index}].location`,
        severity: 'REVIEW',
        message: `Adegan ${scene.sceneNumber}: Detail lokasi atau tipe lingkungan belum lengkap.`,
        suggestion: 'Tentukan tipe lokasi (indoor/outdoor/urban) dan pencahayaan spesifik.',
      });
    }

    // Check 5: Continuity anchors
    if (!scene.continuityAnchors || scene.continuityAnchors.length === 0) {
      issues.push({
        field: `scenes[${index}].continuityAnchors`,
        severity: 'REVIEW',
        message: `Adegan ${scene.sceneNumber}: Tidak memiliki continuity anchors (penjaga konsistensi kostum/karakter).`,
        suggestion: 'Tambahkan jangkar konsistensi visual (misal: "karakter memakai jaket denim yang sama").',
      });
    }

    // Check 6: Prompt Contradiction Check (Image vs Video)
    const imgPromptLower = (scene.imagePrompt || '').toLowerCase();
    const vidPromptLower = (scene.videoPrompt || '').toLowerCase();

    const isNightInImg = imgPromptLower.includes('night') || imgPromptLower.includes('midnight') || imgPromptLower.includes('dark evening');
    const isDayInVid = vidPromptLower.includes('bright sunny noon') || vidPromptLower.includes('midday sun');

    if (isNightInImg && isDayInVid) {
      issues.push({
        field: `scenes[${index}].promptContradiction`,
        severity: 'FAIL',
        message: `Adegan ${scene.sceneNumber}: Kontradiksi waktu antara Image Prompt (Malam) dan Video Prompt (Siang).`,
        suggestion: 'Sinkronkan waktu pencahayaan (time of day) antara image prompt dan video prompt.',
      });
    }

    // Check 7: Dialogue reasonable length check
    if (scene.dialogue && scene.dialogue.length > 250) {
      issues.push({
        field: `scenes[${index}].dialogue`,
        severity: 'REVIEW',
        message: `Adegan ${scene.sceneNumber}: Dialog cukup panjang (${scene.dialogue.length} karakter) untuk adegan video pendek.`,
        suggestion: 'Pertimbangkan meringkas dialog agar pas dengan estimasi durasi scene 5-10 detik.',
      });
    }
  });

  // Check 8: Model Capability compliance check
  const modelCap = getModelCapability(targetModelId);
  if (modelCap.dialogueLipSync === false) {
    const hasDialogue = scenes.some((s) => s.dialogue && s.dialogue.trim().length > 0);
    if (hasDialogue) {
      issues.push({
        field: 'modelCapability.dialogue',
        severity: 'REVIEW',
        message: `Model target "${modelCap.displayName}" belum mendukung native dialogue lip-sync secara resmi.`,
        suggestion: 'Dialog akan diproduksi sebagai audio terpisah atau overlay caption narasi.',
      });
    }
  }

  // Derive overall status
  let overallStatus: QCStatus = 'PASS';
  if (issues.some((i) => i.severity === 'FAIL')) {
    overallStatus = 'FAIL';
  } else if (issues.some((i) => i.severity === 'REVIEW')) {
    overallStatus = 'REVIEW';
  }

  return {
    overallStatus,
    issues,
    checkedAt: new Date().toISOString(),
  };
}
