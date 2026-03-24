# Setup Ollama for FREE Local LLM (Llama 3)

## Why Ollama?

- **100% FREE** - No API costs
- **Private** - All data stays on your machine
- **Offline** - Works without internet
- **Easy Setup** - Takes 5 minutes

## Quick Setup (5 minutes)

### 1. Install Ollama

**Windows:**
```bash
# Download from https://ollama.ai/download/windows
# OR use PowerShell:
winget install Ollama.Ollama
```

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Start Ollama Service

Ollama should start automatically after installation. Verify:
```bash
ollama --version
# Should output: ollama version is 0.1.x
```

### 3. Download Llama 3 Model

```bash
# Download Llama 3 (8B parameters - ~4.7GB)
ollama pull llama3

# OR download Llama 3 (smaller 70B version - ~40GB, better quality)
ollama pull llama3:70b

# Verify installation
ollama list
# Should show: llama3
```

### 4. Test Ollama

```bash
# Test directly in terminal
ollama run llama3 "Extract mood and genre from: chill vibes for studying"

# Should output structured response like:
# Based on the query "chill vibes for studying", I can extract:
# - Mood: chill
# - Genre: lo-fi or ambient
# - Activity: studying
```

### 5. Configure Backend

Add to `backend/.env`:
```bash
# Enable Ollama (FREE option)
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# Set AI provider to Ollama
AI_PROVIDER=ollama

# Optionally disable OpenAI (if you don't have API key)
# OPENAI_API_KEY=
```

### 6. Install Python Dependencies

```bash
cd backend
pip install langchain-ollama
```

### 7. Test Backend AI Search

```bash
python test_ai_music_search.py
```

You should see:
```
✓ Initialized Ollama LLM with model llama3 at http://localhost:11434
✅ All tests passed!
```

## Performance Expectations

**First Query (cold start):** 3-8 seconds
- Ollama needs to load Llama 3 into RAM
- Subsequent queries: 1-3 seconds

**Hardware Requirements:**
- **RAM**: 8GB minimum (16GB recommended for llama3:70b)
- **CPU**: Any modern CPU (4+ cores recommended)
- **GPU**: Optional (NVIDIA GPU can speed up inference 5-10x)

## Troubleshooting

### Ollama service not running

**Windows:**
```bash
# Start Ollama from Start Menu or:
ollama serve
```

**macOS/Linux:**
```bash
brew services start ollama  # macOS
sudo systemctl start ollama  # Linux
```

### Connection refused

If backend can't connect to Ollama:
```bash
# Verify Ollama is running
curl http://localhost:11434/api/version

# Should return: {"version":"0.1.x"}

# If connection fails, check firewall settings
```

### Out of memory

If you get "out of memory" errors:
```bash
# Use smaller model
ollama pull llama3:8b  # 4.7GB vs 40GB for 70b

# Update .env:
OLLAMA_MODEL=llama3:8b
```

### Slow first query

First query is slow because model needs to load into RAM. This is normal!

To speed up, keep Ollama running in background:
```bash
# macOS
brew services start ollama

# Windows
# Ollama auto-starts after installation

# Linux
sudo systemctl enable ollama
sudo systemctl start ollama
```

## Advanced Configuration

### Use GPU (NVIDIA)

If you have NVIDIA GPU with CUDA:
```bash
# Install NVIDIA drivers first
# Then Ollama will auto-detect and use GPU

# Verify GPU is being used
nvidia-smi  # Should show GPU memory usage when Ollama processes queries
```

### Use different model

```bash
# Mistral (faster, slightly less accurate)
ollama pull mistral
# Update .env: OLLAMA_MODEL=mistral

# Phi-3 (Microsoft, very fast)
ollama pull phi3
# Update .env: OLLAMA_MODEL=phi3

# Qwen2 (great for Chinese)
ollama pull qwen2
# Update .env: OLLAMA_MODEL=qwen2
```

### Customize Ollama endpoint

If running Ollama on different machine:
```bash
# Update .env:
OLLAMA_BASE_URL=http://192.168.1.100:11434  # Use your Ollama server IP
```

## Benchmark: OpenAI vs Ollama

| Metric | OpenAI GPT-4o-mini | Ollama Llama 3 |
|--------|-------------------|----------------|
| **Cost** | ~$0.15/1M tokens | FREE |
| **Speed** | 0.5-1s | 1-3s |
| **Accuracy** | 95% | 90-92% |
| **Privacy** | Cloud | Local |
| **Internet** | Required | Optional |

**Recommendation:**
- **Development**: Use Ollama (FREE)
- **Production**: Use OpenAI (faster, more accurate)

## Hybrid Setup (Best of Both)

Configure backend to try OpenAI first, fallback to Ollama:

```bash
# .env configuration
OPENAI_API_KEY=sk-your-key-here  # Optional
OLLAMA_ENABLED=true
AI_PROVIDER=auto  # Try OpenAI → Ollama → Fallback
```

This way:
- If OpenAI API key is configured → Use OpenAI (fast, accurate)
- If OpenAI fails or rate limited → Fallback to Ollama (FREE)
- If both fail → Use keyword extraction (always works)

## Uninstall Ollama

**Windows:**
```bash
winget uninstall Ollama.Ollama
# Or use Control Panel → Add/Remove Programs
```

**macOS:**
```bash
brew uninstall ollama
rm -rf ~/.ollama  # Remove models and data
```

**Linux:**
```bash
systemctl stop ollama
systemctl disable ollama
rm -rf /usr/local/bin/ollama
rm -rf ~/.ollama  # Remove models and data
```

## Next Steps

After Ollama is setup:

1. ✅ Test backend: `python test_ai_music_search.py`
2. ✅ Start backend: `python -m uvicorn app.main:app --reload`
3. ✅ Test API: `POST /api/music/ai-parse`
4. 📝 Implement Vietnam music sources
5. 🎨 Build frontend UI

For questions, check:
- Ollama docs: https://github.com/ollama/ollama
- Llama 3 paper: https://llama.meta.com/llama-3/

Happy coding! 🚀
