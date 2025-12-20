'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export default function MusicSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(30)
  const [currentSong, setCurrentSong] = useState<string>('Carregando...')
  const [playerReady, setPlayerReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const userPausedRef = useRef(false) // Flag para saber se o usuário pausou manualmente
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Carrega a API do YouTube IFrame
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = () => {
        if (containerRef.current && !playerRef.current) {
          const player = new window.YT.Player(containerRef.current, {
            videoId: 'fOBGrF-bQbA',
            playerVars: {
              autoplay: 1,
              mute: 0,
              loop: 1,
              controls: 0,
              modestbranding: 1,
              rel: 0,
              iv_load_policy: 3,
              playsinline: 1,
            },
            events: {
              onReady: (event: any) => {
                console.log('Player pronto!')
                playerRef.current = event.target
                setPlayerReady(true)
                
                // Configurar volume
                try {
                  event.target.setVolume(volume)
                } catch (error) {
                  console.error('Erro ao definir volume:', error)
                }
                
                // Tentar iniciar a reprodução automaticamente
                setTimeout(() => {
                  if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
                    console.log('Tentando iniciar reprodução...')
                    try {
                      playerRef.current.playVideo()
                      // O estado será atualizado pelo onStateChange
                    } catch (error: any) {
                      // Se falhar, o usuário precisará clicar no botão
                      console.log('Autoplay bloqueado, aguardando interação do usuário:', error)
                      setIsPlaying(false)
                    }
                  }
                }, 1500)
                
                // Obter título da música atual
                try {
                  const title = event.target.getVideoData().title
                  setCurrentSong(title || 'Música do Acampamento')
                } catch (error) {
                  setCurrentSong('Música do Acampamento')
                }
              },
              onStateChange: (event: any) => {
                if (event.data === window.YT.PlayerState.PLAYING) {
                  setIsPlaying(true)
                  // Atualizar título quando a música mudar
                  setTimeout(() => {
                    if (playerRef.current && typeof playerRef.current.getVideoData === 'function') {
                      try {
                        const title = playerRef.current.getVideoData().title
                        setCurrentSong(title || 'Música do Acampamento')
                        // Atualizar duração
                        const dur = playerRef.current.getDuration()
                        if (dur) setDuration(dur)
                      } catch (error) {
                        // Ignorar erro silenciosamente
                      }
                    }
                  }, 500)
                } else if (event.data === window.YT.PlayerState.PAUSED) {
                  setIsPlaying(false)
                } else if (event.data === window.YT.PlayerState.ENDED) {
                  setIsPlaying(false)
                  setCurrentTime(0)
                }
              },
            },
          })
        }
      }
    } else if (containerRef.current && !playerRef.current) {
      // Se a API já está carregada
      const player = new window.YT.Player(containerRef.current, {
        videoId: 'ePdRgBWhvog',
        playerVars: {
          list: 'PLcJwc2EmHcCZ9ZoKdbZhxIKQv4RVvnNbc',
          listType: 'playlist',
          autoplay: 1,
          mute: 0,
          loop: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            playerRef.current = event.target
            event.target.setVolume(volume)
            event.target.playVideo()
            setIsPlaying(true)
            // Obter título e duração da música atual
            try {
              const title = event.target.getVideoData().title
              setCurrentSong(title || 'Música do Acampamento')
              // Obter duração inicial
              setTimeout(() => {
                if (playerRef.current && typeof playerRef.current.getDuration === 'function') {
                  try {
                    const dur = playerRef.current.getDuration()
                    if (dur && dur > 0) {
                      setDuration(dur)
                    }
                  } catch (error) {
                    // Ignorar erro
                  }
                }
              }, 1000)
            } catch (error) {
              setCurrentSong('Música do Acampamento')
            }
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true)
              // Atualizar título e duração quando a música mudar
              setTimeout(() => {
                if (playerRef.current && typeof playerRef.current.getVideoData === 'function') {
                  try {
                    const title = playerRef.current.getVideoData().title
                    setCurrentSong(title || 'Música do Acampamento')
                    // Atualizar duração
                    const dur = playerRef.current.getDuration()
                    if (dur && dur > 0) {
                      setDuration(dur)
                    }
                  } catch (error) {
                    // Ignorar erro silenciosamente
                  }
                }
              }, 500)
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false)
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false)
              setCurrentTime(0)
            }
          },
        },
      })
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [])

  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(volume)
    }
  }, [volume])

  // Tentar iniciar automaticamente quando o player estiver pronto (apenas uma vez)
  useEffect(() => {
    if (playerReady && playerRef.current && !isPlaying && !userPausedRef.current) {
      // Aguardar um pouco antes de tentar iniciar
      const timer = setTimeout(() => {
        if (playerRef.current && typeof playerRef.current.playVideo === 'function' && !userPausedRef.current) {
          try {
            playerRef.current.playVideo()
            // O estado será atualizado pelo onStateChange
          } catch (error) {
            // Autoplay bloqueado - usuário precisará clicar
            console.log('Erro ao iniciar reprodução:', error)
            setIsPlaying(false)
          }
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [playerReady]) // Removido isPlaying das dependências para evitar loop

  // Atualizar progresso da música em tempo real
  useEffect(() => {
    if (isPlaying && playerReady && playerRef.current) {
      progressIntervalRef.current = setInterval(() => {
        try {
          if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
            const time = playerRef.current.getCurrentTime()
            if (time !== undefined && !isNaN(time) && time >= 0) {
              setCurrentTime(time)
            }
            // Atualizar duração se necessário
            if (duration === 0 && typeof playerRef.current.getDuration === 'function') {
              const dur = playerRef.current.getDuration()
              if (dur && dur > 0) {
                setDuration(dur)
              }
            }
          }
        } catch (error) {
          // Ignorar erros silenciosamente
        }
      }, 100) // Atualizar a cada 100ms
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }, [isPlaying, playerReady, duration])

  // Função para formatar tempo (segundos para mm:ss)
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calcular porcentagem do progresso
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleTogglePlay = () => {
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function' && typeof playerRef.current.playVideo === 'function') {
      try {
        if (isPlaying) {
          playerRef.current.pauseVideo()
          userPausedRef.current = true // Marcar que o usuário pausou manualmente
          setIsPlaying(false)
        } else {
          userPausedRef.current = false // Resetar a flag quando o usuário clicar em play
          // Primeiro, garantir que não está mudo
          if (playerRef.current.getVolume && playerRef.current.getVolume() === 0) {
            playerRef.current.setVolume(volume)
          }
          playerRef.current.playVideo()
          setIsPlaying(true)
        }
      } catch (error) {
        console.error('Erro ao controlar reprodução:', error)
      }
    } else if (!playerReady) {
      // Se o player ainda não está pronto, mostrar mensagem
      setCurrentSong('Aguardando carregamento do player...')
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, newVolume))
    setVolume(clampedVolume)
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(clampedVolume)
      } catch (error) {
        console.error('Erro ao alterar volume:', error)
      }
    }
  }

  const handleVolumeUp = () => {
    handleVolumeChange(volume + 10)
  }

  const handleVolumeDown = () => {
    handleVolumeChange(volume - 10)
  }

  return (
    <section className="px-4 py-8">
      {/* Iframe oculto para o YouTube */}
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}
      />

      <div className="flex flex-col items-center text-center gap-2 mb-6">
        <div className="inline-flex items-center justify-center p-2 bg-red-900/10 rounded-full text-red-900 mb-1">
          <span className="text-2xl">🎵</span>
        </div>
        <h3 className="text-xl font-bold text-slate-800">Playlist do Reino</h3>
        <p className="text-sm text-slate-500 max-w-[280px] leading-snug">
          Já vai entrando no clima de adoração! Músicas selecionadas para preparar o coração dos jovens.
        </p>
      </div>

      <div className="relative w-full rounded-2xl overflow-hidden shadow-xl shadow-red-900/10 bg-white border border-slate-100">
        {/* Background blur */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 blur-2xl opacity-50 scale-125"></div>
        
        <div className="relative p-5 flex flex-col gap-5 z-10">
          <div className="flex items-center gap-4">
            {/* Capa do álbum */}
            <div className="relative size-20 shrink-0 rounded-xl overflow-hidden shadow-lg group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                <span className="text-3xl text-white">🎵</span>
              </div>
              {isPlaying && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-1">
                  <div className="w-1.5 h-6 bg-yellow-400 rounded-full animate-eq-1"></div>
                  <div className="w-1.5 h-6 bg-yellow-400 rounded-full animate-eq-2"></div>
                  <div className="w-1.5 h-6 bg-yellow-400 rounded-full animate-eq-3"></div>
                  <div className="w-1.5 h-6 bg-yellow-400 rounded-full animate-eq-4"></div>
                </div>
              )}
            </div>
            
            {/* Informações da música */}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                {isPlaying && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-900">
                  {isPlaying ? 'Tocando agora' : 'Pausado'}
                </span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 truncate">{currentSong}</h4>
              <p className="text-xs text-slate-500 truncate font-medium">Acampamento 2026 • Worship</p>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="flex flex-col gap-2 w-full">
            <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden cursor-pointer group">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-900 to-red-600 rounded-full transition-all duration-100"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] font-medium text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center justify-between px-1">
            {/* Controles de Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleVolumeDown}
                className="text-slate-400 hover:text-red-900 transition-colors p-2"
                aria-label="Diminuir volume"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4-3.207a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="flex items-center gap-1 min-w-[80px]">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                  className="w-16 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-900"
                  aria-label="Volume"
                />
                <span className="text-xs text-slate-500 font-medium w-8 text-center">
                  {volume}%
                </span>
              </div>
              <button
                onClick={handleVolumeUp}
                className="text-slate-400 hover:text-red-900 transition-colors p-2"
                aria-label="Aumentar volume"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4-3.207a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  <path d="M11 7a1 1 0 011 1v4a1 1 0 11-2 0V8a1 1 0 011-1zm4 0a1 1 0 011 1v4a1 1 0 11-2 0V8a1 1 0 011-1z" />
                </svg>
              </button>
            </div>
            
            {/* Controles de Play/Pause */}
            <div className="flex items-center gap-6">
              <button className="text-slate-500 hover:text-red-900 transition-colors p-1" aria-label="Música anterior">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                </svg>
              </button>
              
              <button
                onClick={handleTogglePlay}
                className="flex items-center justify-center size-14 bg-red-900 text-white rounded-full shadow-lg shadow-red-900/30 hover:scale-105 active:scale-95 transition-all"
                aria-label={isPlaying ? 'Pausar música' : 'Tocar música'}
              >
                {isPlaying ? (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              
              <button className="text-slate-500 hover:text-red-900 transition-colors p-1" aria-label="Próxima música">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0011 6v2.798l-5.445-3.63z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

