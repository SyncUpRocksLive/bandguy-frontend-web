<script lang="ts">
  let fileInput: HTMLInputElement;
  let isDragging: boolean = false;
  
  type UploadStatus = "idle" | "uploading" | "success" | "error";
  let status: UploadStatus = "idle";
  let progress: number = 0;
  let errorMessage: string = "";

  const uploadEndpoint: string = "/api/legacy/user/setslist/import";
  const acceptedType: string = ".zip";

  const triggerPicker = (): void => fileInput.click();

  const handleFiles = (files: FileList | null): void => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file && file.name.toLowerCase().endsWith(".zip")) {
      uploadFile(file);
    } else {
      showError("File must be a .zip");
    }
  };

  function showError(msg: string) {
    status = "error";
    errorMessage = msg;
    resetAfterDelay();
  }

  function uploadFile(file: File): void {
    status = "uploading";
    progress = 0;
    errorMessage = "";

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e: ProgressEvent) => {
      if (e.lengthComputable) {
        progress = Math.round((e.loaded / e.total) * 100);
      }
    });

    xhr.addEventListener("load", () => {
      // Handle non-200 responses (404, 500, etc.)
      if (xhr.status >= 200 && xhr.status < 300) {
        status = "success";
        resetAfterDelay();
      } else {
        showError(`Error ${xhr.status}: ${xhr.statusText || 'Upload failed'}`);
      }
    });

    xhr.addEventListener("error", () => {
      showError("Network Error");
    });

    xhr.open("POST", uploadEndpoint);
    xhr.send(formData);
  }

  function resetAfterDelay(): void {
    setTimeout(() => {
      status = "idle";
      progress = 0;
    }, 5000);
  }
</script>

<input
  type="file"
  accept={acceptedType}
  bind:this={fileInput}
  on:change={(e) => handleFiles((e.target as HTMLInputElement).files)}
  style="display: none;"
/>

<button
  type="button"
  class="upload-zone"
  class:dragging={isDragging}
  class:uploading={status === 'uploading'}
  class:error={status === 'error'}
  on:click={triggerPicker}
  on:dragover|preventDefault={() => (isDragging = true)}
  on:dragleave|preventDefault={() => (isDragging = false)}
  on:drop|preventDefault={(e) => { isDragging = false; handleFiles(e.dataTransfer?.files || null); }}
  disabled={status === 'uploading'}
>
  {#if status === "uploading"}
    <div class="progress-bar" style="width: {progress}%"></div>
  {/if}

  <div class="content-wrapper">
    <span class="label">
      {#if status === "uploading"}
        Uploading {progress}%
      {:else if status === "success"}
        Import Complete!
      {:else if status === "error"}
        {errorMessage}
      {:else}
        {isDragging ? "Drop to Import" : "Upload .zip Playlist"}
      {/if}
    </span>
    
    {#if status === "error"}
      <small class="retry-hint">Click to try again</small>
    {/if}
  </div>
</button>

<style>
  .upload-zone {
    position: relative;
    overflow: hidden;
    padding: 1rem;
    border: 2px dashed #ccc;
    background: #f9f9f9;
    cursor: pointer;
    border-radius: 8px;
    width: 100%;
    max-width: 320px;
    min-height: 60px;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .upload-zone.dragging {
    border-color: #007bff;
    background: #f0f7ff;
    transform: scale(1.02);
  }

  .upload-zone.error {
    border-color: #dc3545;
    background: #fff5f5;
    color: #dc3545;
  }

  .progress-bar {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: rgba(0, 123, 255, 0.2);
    transition: width 0.1s ease-out;
    z-index: 1;
  }

  .content-wrapper {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    pointer-events: none;
  }

  .label {
    font-weight: 600;
    font-size: 0.95rem;
  }

  .retry-hint {
    font-size: 0.75rem;
    opacity: 0.8;
    margin-top: 2px;
  }

  .upload-zone:disabled {
    cursor: not-allowed;
  }
</style>
