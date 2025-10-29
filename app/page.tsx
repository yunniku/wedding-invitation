"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Volume2, VolumeX } from "lucide-react"

import { GuestbookForm } from "@/components/guestbook-form";
import { GuestbookEntries } from "@/components/guestbook-entries";


export default function Home() {
  const weddingDate = new Date("2025-12-31")
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null) // ✅ 여기 추가
  const [copied, setCopied] = useState<string | null>(null) // ✅ 여기에 위치해야 함 (JSX 바깥!)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // D-day 계산
  useEffect(() => {
    const today = new Date()
    const diff = Math.ceil(
      (weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
    setDaysLeft(diff)
  }, [])

  // BGM 재생 / 일시정지
  useEffect(() => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.play() : audioRef.current.pause()
    }
  }, [isPlaying])

  // 🧭 한 화면씩 정밀 슬라이드 이동
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
  
    let currentSection = 0
    const sections = Array.from(container.querySelectorAll("section"))
    let isScrolling = false
  
    const scrollToSection = (index: number) => {
      if (index < 0 || index >= sections.length) return
      sections[index].scrollIntoView({ behavior: "smooth" })
    }
  
    const handleWheel = (e: WheelEvent) => {
      const guestbook = document.getElementById("guestbook")
      if (!guestbook) return
  
      const isInGuestbook =
        guestbook.getBoundingClientRect().top <= 0 &&
        guestbook.getBoundingClientRect().bottom >= window.innerHeight
  
      if (isInGuestbook) {
        const guestbookEl = guestbook as HTMLElement
        const atTop = guestbookEl.scrollTop === 0
        const atBottom =
          guestbookEl.scrollTop + guestbookEl.clientHeight >= guestbookEl.scrollHeight - 1
  
        // 방명록 내부에서 자유 스크롤 허용
        // 단, 맨 위에서 위로 휠 → 이전 섹션 이동
        // 맨 아래에서 아래로 휠 → 다음 섹션 이동(없으면 무시)
        if (e.deltaY < 0 && atTop) {
          // 위로 스크롤, 4번째 섹션으로 이동
        } else if (e.deltaY > 0 && atBottom) {
          // 아래로 스크롤 시 — 다음 섹션(없음)이므로 그냥 통과
        } else {
          return // 그 외는 방명록 내부 스크롤만 작동
        }
      }
  
      if (isScrolling) return
      isScrolling = true
  
      if (e.deltaY > 0) currentSection++ // 아래로
      else currentSection-- // 위로
  
      currentSection = Math.max(0, Math.min(currentSection, sections.length - 1))
      scrollToSection(currentSection)
  
      setTimeout(() => (isScrolling = false), 1000)
    }
  
    // 📱 모바일 스와이프 감지
    let touchStartY = 0
    let touchEndY = 0
  
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }
  
    const handleTouchEnd = (e: TouchEvent) => {
      touchEndY = e.changedTouches[0].clientY
      const diff = touchStartY - touchEndY
      const guestbook = document.getElementById("guestbook")
      if (!guestbook) return
  
      const isInGuestbook =
        guestbook.getBoundingClientRect().top <= 0 &&
        guestbook.getBoundingClientRect().bottom >= window.innerHeight
  
      if (isInGuestbook) {
        const guestbookEl = guestbook as HTMLElement
        const atTop = guestbookEl.scrollTop === 0
        const atBottom =
          guestbookEl.scrollTop + guestbookEl.clientHeight >= guestbookEl.scrollHeight - 1
  
        if (diff > 80 && atBottom) {
          // 아래로 스와이프 → 다음 섹션
        } else if (diff < -80 && atTop) {
          // 위로 스와이프 → 이전 섹션
        } else {
          return // 중간 스크롤은 방명록 내부만 이동
        }
      }
  
      if (Math.abs(diff) < 80) return // 너무 짧은 스와이프는 무시
  
      if (diff > 0) currentSection++
      else currentSection--
  
      currentSection = Math.max(0, Math.min(currentSection, sections.length - 1))
      scrollToSection(currentSection)
    }
  
    container.addEventListener("wheel", handleWheel, { passive: true })
    container.addEventListener("touchstart", handleTouchStart, { passive: true })
    container.addEventListener("touchend", handleTouchEnd, { passive: true })
  
    return () => {
      container.removeEventListener("wheel", handleWheel)
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [])
  

  // 🎞️ 사진 슬라이드 자동/수동 제어
  useEffect(() => {
    const carousel = document.getElementById("carousel")
    const prevBtn = document.getElementById("prevBtn")
    const nextBtn = document.getElementById("nextBtn")

    if (!carousel || !prevBtn || !nextBtn) return

    const slides = carousel.children
    let index = 0
    const total = slides.length

    const updateSlide = () => {
      carousel.style.transform = `translateX(-${index * 100}%)`
    }

    const nextSlide = () => {
      index = (index + 1) % total
      updateSlide()
    }

    const prevSlide = () => {
      index = (index - 1 + total) % total
      updateSlide()
    }

    // 🔄 자동 전환 (5초)
    let interval = setInterval(nextSlide, 5000)

    // 버튼 클릭
    const resetAuto = () => {
      clearInterval(interval)
      interval = setInterval(nextSlide, 5000)
    }

    prevBtn.addEventListener("click", () => {
      prevSlide()
      resetAuto()
    })
    nextBtn.addEventListener("click", () => {
      nextSlide()
      resetAuto()
    })

    // 📱 스와이프
    let startX = 0
    let endX = 0
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
    }
    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX
      if (startX - endX > 50) nextSlide()
      else if (endX - startX > 50) prevSlide()
      resetAuto()
    }

    carousel.addEventListener("touchstart", handleTouchStart)
    carousel.addEventListener("touchend", handleTouchEnd)

    return () => {
      clearInterval(interval)
      carousel.removeEventListener("touchstart", handleTouchStart)
      carousel.removeEventListener("touchend", handleTouchEnd)
    }
  }, [])



  return (
    <div ref={containerRef} className="h-screen w-full overflow-hidden font-[var(--font-modern)]">

      {/* 🎵 배경음악 */}
      <audio ref={audioRef} loop src="/bgm.mp3" />

      {/* 🎧 BGM 버튼 */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="fixed top-6 right-6 bg-white/70 backdrop-blur-md rounded-full p-3 shadow-md hover:scale-110 transition-transform z-50"
      >
        {isPlaying ? <Volume2 size={22} /> : <VolumeX size={22} />}
      </button>

      {/* 1️⃣ 표지 */}
      <section
        className="h-screen flex flex-col items-center justify-center bg-cover bg-center text-black text-center"
        style={{ backgroundImage: "url('/wedding-bg.jpg')" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-md"
        >
          <h1 className="text-4xl font-bold mb-6">결혼식에 초대합니다 💍</h1>
          <p className="text-lg leading-relaxed max-w-md mx-auto">
            두 사람의 새로운 시작을 축복해 주시기 위해 <br />
            소중한 여러분을 초대합니다.
          </p>
        </motion.div>
      </section>

      {/* 2️⃣ 인사말 */}
      <section className="h-screen flex flex-col items-center justify-center bg-white text-gray-800 px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-3xl font-semibold mb-6"
        >
          감사 인사 드립니다 💕
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="max-w-lg text-lg leading-relaxed"
        >
          서로의 마음을 확인하며 함께 걸어갈 <br />
          새로운 길 위에 서게 되었습니다. <br />
          귀한 걸음으로 축하해 주시면 감사하겠습니다.
        </motion.p>
      </section>

      {/* 3️⃣ 오시는 길 + 마음 전하는 곳 */}
      <section className="h-screen flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-3xl font-semibold mb-6 text-gray-800"
        >
          오시는 길 🗺️
        </motion.h2>

        {/* 📍 장소 및 주소 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="bg-white rounded-xl shadow-md p-6 max-w-md w-full mb-6"
        >
          <p className="text-xl font-semibold mb-2 text-gray-800">
            웨딩시티 신도림 7F 라온홀
          </p>
          <p className="text-gray-600 mb-4">
            서울특별시 구로구 경인로 662 (신도림1동 337-1)
          </p>

          <a
            href="https://map.naver.com/v5/search/웨딩시티%20신도림"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-500 text-white px-5 py-2 rounded-lg shadow hover:bg-green-600 transition"
          >
            📍 네이버지도에서 보기
          </a>
        </motion.div>

        {/* 💌 마음 전하는 곳 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="bg-white rounded-xl shadow-md p-6 max-w-md w-full"
        >
          <h3 className="text-2xl font-semibold mb-3 text-gray-800">
            마음 전하는 곳 💌
          </h3>

          {/* 신랑 */}
          <div className="mb-4">
            <p className="font-medium text-gray-700">👦 신랑 김명재</p>
            <p className="text-sm text-gray-600">📞 010-1234-5678</p>
            <div className="flex justify-center gap-2 mt-2">
              <button
                className={`px-4 py-1 rounded-lg text-sm transition ${
                  copied === 'groom'
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                onClick={() => {
                  navigator.clipboard.writeText('신한 110-123-456789 (김명재)')
                  setCopied('groom')
                  setTimeout(() => setCopied(null), 2000)
                }}
              >
                {copied === 'groom' ? '✅ 복사됨' : '💳 계좌 복사'}
              </button>
              <button
                className="bg-gray-100 text-gray-700 px-4 py-1 rounded-lg hover:bg-gray-200 transition text-sm"
                onClick={() => window.open('tel:01012345678')}
              >
                📞 전화하기
              </button>
            </div>
          </div>

          {/* 신부 */}
          <div className="mb-4">
            <p className="font-medium text-gray-700">👰 신부 박윤희</p>
            <p className="text-sm text-gray-600">📞 010-9876-5432</p>
            <div className="flex justify-center gap-2 mt-2">
              <button
                className={`px-4 py-1 rounded-lg text-sm transition ${
                  copied === 'bride'
                    ? 'bg-green-500 text-white'
                    : 'bg-pink-500 text-white hover:bg-pink-600'
                }`}
                onClick={() => {
                  navigator.clipboard.writeText('국민 123456-78-987654 (박윤희)')
                  setCopied('bride')
                  setTimeout(() => setCopied(null), 2000)
                }}
              >
                {copied === 'bride' ? '✅ 복사됨' : '💳 계좌 복사'}
              </button>
              <button
                className="bg-gray-100 text-gray-700 px-4 py-1 rounded-lg hover:bg-gray-200 transition text-sm"
                onClick={() => window.open('tel:01098765432')}
              >
                📞 전화하기
              </button>
            </div>
          </div>

          {/* 🌿 환경 보호 문구 */}
          <p className="text-sm text-gray-500 mt-6 italic leading-relaxed">
            환경 보호를 위해 화환은 정중히 사양하오니 양해 부탁드립니다.
          </p>
        </motion.div>

      </section>


      {/* 4️⃣ 사진 갤러리 섹션 */}
      <section className="h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-3xl font-semibold mb-6 text-gray-800"
        >
          우리의 추억들 📸
        </motion.h2>

        {/* 슬라이드 컨테이너 */}
        <div className="relative w-full max-w-lg h-[60vh] overflow-hidden rounded-xl shadow-md">
          <div
            id="carousel"
            className="flex w-full h-full transition-transform duration-700 ease-in-out"
          >
            {/* 📷 사진 리스트 */}
            {["photo1.jpg", "photo2.jpg", "photo3.jpg", "photo4.jpg"].map((img, i) => (
              <img
                key={i}
                src={`/${img}`}
                alt={`slide-${i}`}
                className="w-full h-full object-cover flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
                onClick={() => setFullscreenImage(`/${img}`)} // ✅ 클릭 시 전체화면
              />
            ))}
          </div>

          {/* ⬅️ ➡️ 수동 이동 버튼 */}
          <button
            id="prevBtn"
            className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/70 p-2 rounded-full shadow hover:bg-white transition z-10"
          >
            ◀
          </button>
          <button
            id="nextBtn"
            className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/70 p-2 rounded-full shadow hover:bg-white transition z-10"
          >
            ▶
          </button>
        </div>

        {/* 📸 전체화면 보기 (Lightbox) */}
        {fullscreenImage && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-fadeIn"
            onClick={() => setFullscreenImage(null)} // 배경 클릭 시 닫기
          >
            <img
              src={fullscreenImage}
              alt="fullscreen"
              className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg animate-zoomIn"
            />
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-6 right-6 text-white text-3xl font-bold"
            >
            </button>
          </div>
        )}
      </section>

      <section id="guestbook" className="py-24 bg-white text-center h-screen overflow-y-auto">
        <h2 className="text-4xl font-bold mb-8 text-gray-800">방명록</h2>
        <p className="text-gray-600 mb-12">축하 메시지를 남겨주세요 💌</p>

        <div className="max-w-3xl mx-auto px-4">
          <GuestbookForm />
          <GuestbookEntries />
        </div>
      </section>

    </div>
  )
}
