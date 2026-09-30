(function () {
    let currentFile = null;
    let currentImage = null;
    let originalDataUrl = null;
    let originalMime = 'image/png';

    const results = {
        compress: { blob: null, name: '' },
        resize: { blob: null, name: '' },
        convert: { blob: null, name: '' },
        crop: { blob: null, name: '' },
        favicon: { blob: null, name: '' }
    };

    const uploadArea = document.getElementById('uploadArea');
    const globalFileInput = document.getElementById('globalFileInput');
    const fileBadge = document.getElementById('fileBadge');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const fileSizeDisplay = document.getElementById('fileSizeDisplay');
    const fileDimsDisplay = document.getElementById('fileDimsDisplay');
    const globalError = document.getElementById('globalError');

    const tabBtns = document.querySelectorAll('.tab-btn');
    const panels = {
        compress: document.getElementById('panel-compress'),
        resize: document.getElementById('panel-resize'),
        convert: document.getElementById('panel-convert'),
        crop: document.getElementById('panel-crop'),
        favicon: document.getElementById('panel-favicon')
    };

    const MIME_INFO = {
        'image/jpeg': { label: 'JPEG', ext: 'jpg' },
        'image/jpg': { label: 'JPEG', ext: 'jpg' },
        'image/png': { label: 'PNG', ext: 'png' },
        'image/webp': { label: 'WEBP', ext: 'webp' },
        'image/avif': { label: 'AVIF', ext: 'avif' },
        'image/gif': { label: 'GIF', ext: 'gif' },
        'image/bmp': { label: 'BMP', ext: 'bmp' }
    };

    function getMimeInfo(mime) {
        return MIME_INFO[mime] || { label: (mime.split('/')[1] || 'IMG').toUpperCase(), ext: 'img' };
    }

    // Get a safe encodable output mime based on source
    function getSafeOutputMime(sourceMime) {
        const supported = ['image/jpeg', 'image/png', 'image/webp'];
        if (supported.includes(sourceMime)) return sourceMime;
        return 'image/png'; // fallback for GIF/BMP/AVIF (if unsupported)
    }

    function formatBytes(bytes, decimals = 1) {
        if (bytes === 0 || bytes === undefined) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function showError(msg) {
        globalError.textContent = msg;
        globalError.classList.remove('hidden');
        setTimeout(() => {
            if (globalError.textContent === msg) globalError.classList.add('hidden');
        }, 5000);
    }

    function clearError() {
        globalError.classList.add('hidden');
        globalError.textContent = '';
    }

    function loadFile(file) {
        clearError();
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showError('Please select an image file.');
            return;
        }
        if (file.size > 15 * 1024 * 1024) {
            showError('File too large (max 15MB).');
            return;
        }

        Object.keys(results).forEach(k => { results[k].blob = null; results[k].name = ''; });
        updateAllDownloadButtons();

        currentFile = file;
        originalMime = file.type || 'image/png';

        fileNameDisplay.textContent = file.name;
        fileSizeDisplay.textContent = formatBytes(file.size);
        fileBadge.classList.remove('hidden');

        // Update resize info tag
        const safeOut = getSafeOutputMime(originalMime);
        const info = getMimeInfo(safeOut);
        const originalInfo = getMimeInfo(originalMime);
        const tag = document.getElementById('resizeFormatTag');
        if (safeOut === originalMime) {
            tag.textContent = info.label;
            tag.title = 'Same as original';
        } else {
            tag.textContent = info.label + ' (from ' + originalInfo.label + ')';
            tag.title = 'Source format not encodable — using ' + info.label;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                currentImage = img;
                originalDataUrl = e.target.result;
                fileDimsDisplay.textContent = `${img.width}×${img.height}`;
                updateOriginalPreviews();
                enableAllToolButtons(true);

                if (panels.crop.classList.contains('active')) initCropCanvas();

                document.getElementById('faviconPreviewGrid').innerHTML = `
                        <div class="favicon-preview-item">
                            <div class="favicon-box"><span style="color:#4a6f9a; font-size:0.7rem;">—</span></div>
                            <span>ready</span>
                        </div>
                    `;
            };
            img.onerror = () => showError('Could not load image.');
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function updateOriginalPreviews() {
        const previews = ['compress', 'resize', 'convert'];
        previews.forEach(tool => {
            const imgEl = document.getElementById(`${tool}OriginalImg`);
            const placeEl = document.getElementById(`${tool}OriginalPlaceholder`);
            const nameEl = document.getElementById(`${tool}OriginalName`);
            if (originalDataUrl) {
                imgEl.src = originalDataUrl;
                imgEl.classList.remove('hidden');
                placeEl.classList.add('hidden');
                nameEl.textContent = currentFile.name;
            } else {
                imgEl.classList.add('hidden');
                placeEl.classList.remove('hidden');
                nameEl.textContent = '—';
            }
            document.getElementById(`${tool}OriginalSize`).textContent = currentFile ? formatBytes(currentFile.size) : '—';
        });
        document.getElementById('cropResultImg').classList.add('hidden');
        document.getElementById('cropResultPlaceholder').classList.remove('hidden');
        document.getElementById('cropResultName').textContent = '—';
        document.getElementById('faviconOriginalSize').textContent = currentFile ? formatBytes(currentFile.size) : '—';
        document.getElementById('resizeBadge').textContent = getMimeInfo(getSafeOutputMime(originalMime)).label;
    }

    function enableAllToolButtons(enabled) {
        document.getElementById('compressBtn').disabled = !enabled;
        document.getElementById('resizeBtn').disabled = !enabled;
        document.getElementById('convertBtn').disabled = !enabled;
        document.getElementById('cropBtn').disabled = !enabled;
        document.getElementById('faviconBtn').disabled = !enabled;
    }

    function updateAllDownloadButtons() {
        Object.keys(results).forEach(tool => {
            const btn = document.getElementById(`${tool}DownloadBtn`);
            if (btn) btn.disabled = !results[tool].blob;
        });
    }

    uploadArea.addEventListener('click', () => globalFileInput.click());
    globalFileInput.addEventListener('change', (e) => {
        if (e.target.files.length) loadFile(e.target.files[0]);
        globalFileInput.value = '';
    });
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => {
        uploadArea.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); });
    });
    uploadArea.addEventListener('dragenter', () => uploadArea.classList.add('drag-over'));
    uploadArea.addEventListener('dragover', () => uploadArea.classList.add('drag-over'));
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => {
        uploadArea.classList.remove('drag-over');
        if (e.dataTransfer.files.length) loadFile(e.dataTransfer.files[0]);
    });

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tool = btn.dataset.tool;
            Object.keys(panels).forEach(k => panels[k].classList.remove('active'));
            panels[tool].classList.add('active');
            if (tool === 'crop' && currentImage) initCropCanvas();
        });
    });

    function setupFormatSelector(containerId, badgeId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const btns = container.querySelectorAll('.format-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (badgeId) document.getElementById(badgeId).textContent = btn.textContent.trim();
            });
        });
    }
    setupFormatSelector('compressFormat', 'compressBadge');
    setupFormatSelector('convertFormat', 'convertBadge');
    setupFormatSelector('cropFormat', null);

    function getSelectedFormat(containerId) {
        const active = document.querySelector(`#${containerId} .format-btn.active`);
        return active ? active.dataset.format : 'image/jpeg';
    }

    function bindQualitySlider(sliderId, displayId) {
        const slider = document.getElementById(sliderId);
        const display = document.getElementById(displayId);
        if (!slider) return;
        slider.addEventListener('input', () => {
            display.textContent = Math.round(slider.value * 100) + '%';
        });
    }
    bindQualitySlider('compressQuality', 'compressQualityVal');
    bindQualitySlider('convertQuality', 'convertQualityVal');

    function canvasToBlob(canvas, mime, quality) {
        return new Promise(resolve => canvas.toBlob(resolve, mime, quality));
    }

    // COMPRESS
    document.getElementById('compressBtn').addEventListener('click', async () => {
        if (!currentImage) return;
        const format = getSelectedFormat('compressFormat');
        const quality = parseFloat(document.getElementById('compressQuality').value);
        const canvas = document.createElement('canvas');
        canvas.width = currentImage.width;
        canvas.height = currentImage.height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(currentImage, 0, 0);
        const blob = await canvasToBlob(canvas, format, quality);
        if (!blob) { showError('Compression failed.'); return; }
        const info = getMimeInfo(format);
        const name = currentFile.name.replace(/\.[^/.]+$/, '') + '-compressed.' + info.ext;
        results.compress = { blob, name };
        const url = URL.createObjectURL(blob);
        const imgEl = document.getElementById('compressResultImg');
        imgEl.src = url;
        imgEl.classList.remove('hidden');
        document.getElementById('compressResultPlaceholder').classList.add('hidden');
        document.getElementById('compressResultName').textContent = name;
        document.getElementById('compressNewSize').textContent = formatBytes(blob.size);
        const saved = currentFile.size > 0 ? Math.round((1 - blob.size / currentFile.size) * 100) : 0;
        document.getElementById('compressSaved').textContent = saved + '%';
        document.getElementById('compressDownloadBtn').disabled = false;
    });

    // RESIZE — no format selector, uses original format
    document.getElementById('resizeBtn').addEventListener('click', async () => {
        if (!currentImage) return;
        const format = getSafeOutputMime(originalMime);
        const info = getMimeInfo(format);

        let w = parseInt(document.getElementById('resizeWidth').value) || currentImage.width;
        let h = parseInt(document.getElementById('resizeHeight').value) || currentImage.height;
        const keepAspect = document.getElementById('keepAspect').checked;
        if (keepAspect) {
            if (document.getElementById('resizeWidth').value && !document.getElementById('resizeHeight').value) {
                h = Math.round(currentImage.height * (w / currentImage.width));
            } else if (!document.getElementById('resizeWidth').value && document.getElementById('resizeHeight').value) {
                w = Math.round(currentImage.width * (h / currentImage.height));
            }
        }
        w = Math.max(1, Math.min(10000, w));
        h = Math.max(1, Math.min(10000, h));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(currentImage, 0, 0, w, h);

        // quality: only for lossy formats; PNG ignores it
        const quality = (format === 'image/png') ? undefined : 0.92;
        const blob = await canvasToBlob(canvas, format, quality);
        if (!blob) { showError('Resize failed.'); return; }

        const name = currentFile.name.replace(/\.[^/.]+$/, '') + `-${w}x${h}.` + info.ext;
        results.resize = { blob, name };

        const url = URL.createObjectURL(blob);
        const imgEl = document.getElementById('resizeResultImg');
        imgEl.src = url;
        imgEl.classList.remove('hidden');
        document.getElementById('resizeResultPlaceholder').classList.add('hidden');
        document.getElementById('resizeResultName').textContent = name;
        document.getElementById('resizeNewSize').textContent = formatBytes(blob.size);
        document.getElementById('resizeDims').textContent = `${w} × ${h}`;
        document.getElementById('resizeBadge').textContent = info.label;
        document.getElementById('resizeDownloadBtn').disabled = false;
    });

    // CONVERT
    document.getElementById('convertBtn').addEventListener('click', async () => {
        if (!currentImage) return;
        const format = getSelectedFormat('convertFormat');
        const quality = parseFloat(document.getElementById('convertQuality').value);
        const canvas = document.createElement('canvas');
        canvas.width = currentImage.width;
        canvas.height = currentImage.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(currentImage, 0, 0);
        const blob = await canvasToBlob(canvas, format, quality);
        if (!blob) { showError('Conversion failed.'); return; }
        const info = getMimeInfo(format);
        const name = currentFile.name.replace(/\.[^/.]+$/, '') + '-converted.' + info.ext;
        results.convert = { blob, name };
        const url = URL.createObjectURL(blob);
        const imgEl = document.getElementById('convertResultImg');
        imgEl.src = url;
        imgEl.classList.remove('hidden');
        document.getElementById('convertResultPlaceholder').classList.add('hidden');
        document.getElementById('convertResultName').textContent = name;
        document.getElementById('convertNewSize').textContent = formatBytes(blob.size);
        document.getElementById('convertDownloadBtn').disabled = false;
    });

    // CROP
    const cropContainer = document.getElementById('cropContainer');
    const cropCanvas = document.getElementById('cropCanvas');
    const cropSelection = document.getElementById('cropSelection');
    let cropCtx = cropCanvas.getContext('2d');
    let cropRect = { x: 0, y: 0, w: 100, h: 100 };
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let dragType = null;
    let cropImageLoaded = false;

    function initCropCanvas() {
        if (!currentImage) return;
        cropCanvas.width = currentImage.width;
        cropCanvas.height = currentImage.height;
        cropCtx.drawImage(currentImage, 0, 0);
        const cw = Math.round(currentImage.width * 0.7);
        const ch = Math.round(currentImage.height * 0.7);
        cropRect = {
            x: Math.round((currentImage.width - cw) / 2),
            y: Math.round((currentImage.height - ch) / 2),
            w: cw,
            h: ch
        };
        updateCropUI();
        cropImageLoaded = true;
        syncCropInputs();
    }

    function updateCropUI() {
        const canvasDisplayWidth = cropCanvas.clientWidth;
        const canvasDisplayHeight = cropCanvas.clientHeight;
        const scaleX = canvasDisplayWidth / cropCanvas.width;
        const scaleY = canvasDisplayHeight / cropCanvas.height;
        cropSelection.style.left = (cropRect.x * scaleX) + 'px';
        cropSelection.style.top = (cropRect.y * scaleY) + 'px';
        cropSelection.style.width = (cropRect.w * scaleX) + 'px';
        cropSelection.style.height = (cropRect.h * scaleY) + 'px';
    }

    function syncCropInputs() {
        document.getElementById('cropX').value = Math.round(cropRect.x);
        document.getElementById('cropY').value = Math.round(cropRect.y);
        document.getElementById('cropW').value = Math.round(cropRect.w);
        document.getElementById('cropH').value = Math.round(cropRect.h);
    }

    window.addEventListener('resize', () => {
        if (panels.crop.classList.contains('active') && cropImageLoaded) updateCropUI();
    });

    cropSelection.addEventListener('mousedown', (e) => {
        if (!cropImageLoaded) return;
        const handle = e.target.dataset.handle;
        dragType = handle || 'move';
        isDragging = true;
        dragStart.x = e.clientX;
        dragStart.y = e.clientY;
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging || !cropImageLoaded) return;
        const scaleX = cropCanvas.width / cropCanvas.clientWidth;
        const scaleY = cropCanvas.height / cropCanvas.clientHeight;
        const dx = (e.clientX - dragStart.x) * scaleX;
        const dy = (e.clientY - dragStart.y) * scaleY;
        dragStart.x = e.clientX;
        dragStart.y = e.clientY;

        let newRect = { ...cropRect };
        if (dragType === 'move') {
            newRect.x = Math.max(0, Math.min(cropCanvas.width - newRect.w, newRect.x + dx));
            newRect.y = Math.max(0, Math.min(cropCanvas.height - newRect.h, newRect.y + dy));
        } else {
            const minSize = 10;
            if (dragType.includes('e')) newRect.w = Math.max(minSize, Math.min(cropCanvas.width - newRect.x, newRect.w + dx));
            if (dragType.includes('s')) newRect.h = Math.max(minSize, Math.min(cropCanvas.height - newRect.y, newRect.h + dy));
            if (dragType.includes('w')) {
                const newW = Math.max(minSize, newRect.w - dx);
                const newX = Math.max(0, newRect.x + dx);
                if (newX + newW <= cropCanvas.width) { newRect.w = newW; newRect.x = newX; }
            }
            if (dragType.includes('n')) {
                const newH = Math.max(minSize, newRect.h - dy);
                const newY = Math.max(0, newRect.y + dy);
                if (newY + newH <= cropCanvas.height) { newRect.h = newH; newRect.y = newY; }
            }
        }
        cropRect = newRect;
        updateCropUI();
        syncCropInputs();
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        dragType = null;
    });

    ['cropX', 'cropY', 'cropW', 'cropH'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            if (!cropImageLoaded) return;
            let x = parseInt(document.getElementById('cropX').value) || 0;
            let y = parseInt(document.getElementById('cropY').value) || 0;
            let w = parseInt(document.getElementById('cropW').value) || 50;
            let h = parseInt(document.getElementById('cropH').value) || 50;
            x = Math.max(0, Math.min(cropCanvas.width - 10, x));
            y = Math.max(0, Math.min(cropCanvas.height - 10, y));
            w = Math.max(10, Math.min(cropCanvas.width - x, w));
            h = Math.max(10, Math.min(cropCanvas.height - y, h));
            cropRect = { x, y, w, h };
            updateCropUI();
            syncCropInputs();
        });
    });

    document.getElementById('cropBtn').addEventListener('click', async () => {
        if (!currentImage || !cropImageLoaded) return;
        const format = getSelectedFormat('cropFormat');
        const info = getMimeInfo(format);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(cropRect.w);
        canvas.height = Math.round(cropRect.h);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(currentImage,
            Math.round(cropRect.x), Math.round(cropRect.y), Math.round(cropRect.w), Math.round(cropRect.h),
            0, 0, canvas.width, canvas.height);
        const blob = await canvasToBlob(canvas, format, 0.92);
        if (!blob) { showError('Crop failed.'); return; }
        const name = currentFile.name.replace(/\.[^/.]+$/, '') + '-cropped.' + info.ext;
        results.crop = { blob, name };
        const url = URL.createObjectURL(blob);
        const imgEl = document.getElementById('cropResultImg');
        imgEl.src = url;
        imgEl.classList.remove('hidden');
        document.getElementById('cropResultPlaceholder').classList.add('hidden');
        document.getElementById('cropResultName').textContent = name;
        document.getElementById('cropDownloadBtn').disabled = false;
    });

    // FAVICON
    let selectedBitDepth = 32;

    document.querySelectorAll('.bit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.bit-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedBitDepth = parseInt(btn.dataset.bits);
            document.getElementById('faviconBitBadge').textContent = selectedBitDepth + '-bit';
        });
    });

    function quantizeTo8Bit(imageData) {
        const data = imageData.data;
        const levels = 6;
        const step = 255 / (levels - 1);
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.round(Math.round(data[i] / step) * step);
            data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
            data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
        }
        return imageData;
    }

    async function buildIcoFile(pngBlobs, sizes, is32bit) {
        const numImages = pngBlobs.length;
        const headerSize = 6;
        const dirEntrySize = 16;
        const dirSize = numImages * dirEntrySize;
        const dataOffset = headerSize + dirSize;

        const pngBytesList = [];
        for (const blob of pngBlobs) {
            const buf = await blob.arrayBuffer();
            pngBytesList.push(new Uint8Array(buf));
        }

        let totalDataSize = 0;
        pngBytesList.forEach(b => totalDataSize += b.length);

        const buffer = new ArrayBuffer(dataOffset + totalDataSize);
        const view = new DataView(buffer);
        const uint8 = new Uint8Array(buffer);

        view.setUint16(0, 0, true);
        view.setUint16(2, 1, true);
        view.setUint16(4, numImages, true);

        let currentDataOffset = dataOffset;
        pngBytesList.forEach((pngBytes, index) => {
            const size = sizes[index];
            const dirOffset = headerSize + index * dirEntrySize;

            const w = size >= 256 ? 0 : size;
            const h = size >= 256 ? 0 : size;
            const colorCount = is32bit ? 0 : 256;
            const reserved = 0;
            const planes = 1;
            const bitCount = is32bit ? 32 : 8;

            view.setUint8(dirOffset, w);
            view.setUint8(dirOffset + 1, h);
            view.setUint8(dirOffset + 2, colorCount);
            view.setUint8(dirOffset + 3, reserved);
            view.setUint16(dirOffset + 4, planes, true);
            view.setUint16(dirOffset + 6, bitCount, true);
            view.setUint32(dirOffset + 8, pngBytes.length, true);
            view.setUint32(dirOffset + 12, currentDataOffset, true);

            uint8.set(pngBytes, currentDataOffset);
            currentDataOffset += pngBytes.length;
        });

        return new Blob([buffer], { type: 'image/x-icon' });
    }

    document.getElementById('faviconBtn').addEventListener('click', async () => {
        if (!currentImage) return;

        const sizes = [];
        if (document.getElementById('faviconSizes16').checked) sizes.push(16);
        if (document.getElementById('faviconSizes32').checked) sizes.push(32);
        if (document.getElementById('faviconSizes48').checked) sizes.push(48);
        if (document.getElementById('faviconSizes64').checked) sizes.push(64);
        if (document.getElementById('faviconSizes128').checked) sizes.push(128);
        if (document.getElementById('faviconSizes256').checked) sizes.push(256);

        if (sizes.length === 0) {
            showError('Please select at least one size.');
            return;
        }

        const padSquare = document.getElementById('faviconPadSquare').checked;
        const is32bit = selectedBitDepth === 32;

        const favBtn = document.getElementById('faviconBtn');
        favBtn.disabled = true;
        favBtn.textContent = '⏳ Generating...';

        try {
            const pngBlobs = [];
            const previews = [];

            for (const size of sizes) {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.clearRect(0, 0, size, size);

                const imgRatio = currentImage.width / currentImage.height;
                let drawW, drawH, drawX, drawY;

                if (padSquare) {
                    if (imgRatio > 1) {
                        drawW = size;
                        drawH = size / imgRatio;
                        drawX = 0;
                        drawY = (size - drawH) / 2;
                    } else {
                        drawH = size;
                        drawW = size * imgRatio;
                        drawX = (size - drawW) / 2;
                        drawY = 0;
                    }
                } else {
                    drawW = size;
                    drawH = size;
                    drawX = 0;
                    drawY = 0;
                }

                ctx.drawImage(currentImage, drawX, drawY, drawW, drawH);

                if (!is32bit) {
                    const imageData = ctx.getImageData(0, 0, size, size);
                    quantizeTo8Bit(imageData);
                    ctx.putImageData(imageData, 0, 0);
                }

                const blob = await canvasToBlob(canvas, 'image/png', 1.0);
                if (!blob) throw new Error('Failed to render size ' + size);

                pngBlobs.push(blob);
                previews.push({ size, dataUrl: canvas.toDataURL('image/png') });
            }

            const icoBlob = await buildIcoFile(pngBlobs, sizes, is32bit);
            const name = currentFile.name.replace(/\.[^/.]+$/, '') + '-favicon.ico';
            results.favicon = { blob: icoBlob, name };

            const previewGrid = document.getElementById('faviconPreviewGrid');
            previewGrid.innerHTML = '';
            previews.forEach(({ size, dataUrl }) => {
                const item = document.createElement('div');
                item.className = 'favicon-preview-item';
                item.innerHTML = `
                        <div class="favicon-box"><img src="${dataUrl}" width="${size}" height="${size}" alt="${size}x${size}"></div>
                        <span>${size}×${size}</span>
                    `;
                previewGrid.appendChild(item);
            });

            document.getElementById('faviconNewSize').textContent = formatBytes(icoBlob.size);
            document.getElementById('faviconSizeCount').textContent = sizes.length + ' size' + (sizes.length > 1 ? 's' : '');
            document.getElementById('faviconDownloadBtn').disabled = false;
        } catch (err) {
            console.error(err);
            showError('Favicon generation failed: ' + err.message);
        } finally {
            favBtn.disabled = false;
            favBtn.textContent = '⭐ Generate favicon ICO';
        }
    });

    function setupDownload(tool) {
        const btn = document.getElementById(`${tool}DownloadBtn`);
        if (!btn) return;
        btn.addEventListener('click', () => {
            const res = results[tool];
            if (!res.blob) {
                showError('No result to download.');
                return;
            }
            const link = document.createElement('a');
            link.href = URL.createObjectURL(res.blob);
            link.download = res.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        });
    }
    setupDownload('compress');
    setupDownload('resize');
    setupDownload('convert');
    setupDownload('crop');
    setupDownload('favicon');

    enableAllToolButtons(false);
    updateAllDownloadButtons();
    document.getElementById('compressQualityVal').textContent = '75%';
    document.getElementById('convertQualityVal').textContent = '85%';
})();