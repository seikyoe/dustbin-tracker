"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  MapPin,
  Plus,
  Recycle,
  Leaf,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Zap,
  Trophy,
  Medal,
  Award,
  Star,
  Map,
  User,
  Filter,
  DollarSign,
  Camera,
  Scan,
  Package,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any
    initMap: () => void
    initGoogleMap: () => void
  }
}

interface Dustbin {
  id: string
  name: string
  type: "general" | "recycling" | "organic" | "hazardous"
  status: "empty" | "half-full" | "full" | "damaged" | "missing"
  latitude: number
  longitude: number
  address: string
  lastUpdated: Date
  reportedBy?: string
}

interface LeaderboardUser {
  id: string
  name: string
  avatar?: string
  points: number
  binsReported: number
  statusUpdates: number
  rank: number
  badge: "gold" | "silver" | "bronze" | "contributor" | "newbie"
  earnings: number
}

interface Task {
  id: string
  title: string
  description: string
  reward: number
  type: "scan" | "collect" | "report" | "survey"
  icon: React.ComponentType<{ className?: string }>
  difficulty: "easy" | "medium" | "hard"
  estimatedTime: string
  requirements: string[]
  completed: boolean
  progress?: number
  maxProgress?: number
}

const mockDustbins: Dustbin[] = [
  {
    id: "1",
    name: "Main Street Bin",
    type: "general",
    status: "half-full",
    latitude: 40.7128,
    longitude: -74.006,
    address: "123 Main Street, NYC",
    lastUpdated: new Date("2024-01-15T10:30:00"),
    reportedBy: "John D.",
  },
  {
    id: "2",
    name: "Park Recycling",
    type: "recycling",
    status: "full",
    latitude: 40.7589,
    longitude: -73.9851,
    address: "Central Park East, NYC",
    lastUpdated: new Date("2024-01-15T14:20:00"),
    reportedBy: "Sarah M.",
  },
  {
    id: "3",
    name: "Organic Station",
    type: "organic",
    status: "empty",
    latitude: 40.7505,
    longitude: -73.9934,
    address: "456 Green Avenue, NYC",
    lastUpdated: new Date("2024-01-15T09:15:00"),
    reportedBy: "Mike R.",
  },
  {
    id: "4",
    name: "Hazardous Unit",
    type: "hazardous",
    status: "damaged",
    latitude: 40.7282,
    longitude: -73.7949,
    address: "789 Industrial Road, NYC",
    lastUpdated: new Date("2024-01-14T16:45:00"),
    reportedBy: "Lisa K.",
  },
  {
    id: "5",
    name: "Mall Recycling",
    type: "recycling",
    status: "empty",
    latitude: 40.7614,
    longitude: -73.9776,
    address: "Shopping Mall, NYC",
    lastUpdated: new Date("2024-01-15T11:30:00"),
    reportedBy: "Alex P.",
  },
  {
    id: "6",
    name: "School Bin",
    type: "general",
    status: "full",
    latitude: 40.7831,
    longitude: -73.9712,
    address: "Elementary School, NYC",
    lastUpdated: new Date("2024-01-15T13:15:00"),
    reportedBy: "Teacher",
  },
]

const mockLeaderboard: LeaderboardUser[] = [
  {
    id: "1",
    name: "Sarah M.",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 1250,
    binsReported: 15,
    statusUpdates: 45,
    rank: 1,
    badge: "gold",
    earnings: 127.5,
  },
  {
    id: "2",
    name: "John D.",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 980,
    binsReported: 12,
    statusUpdates: 38,
    rank: 2,
    badge: "silver",
    earnings: 98.0,
  },
  {
    id: "3",
    name: "Mike R.",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 750,
    binsReported: 8,
    statusUpdates: 29,
    rank: 3,
    badge: "bronze",
    earnings: 75.0,
  },
  {
    id: "4",
    name: "Lisa K.",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 620,
    binsReported: 7,
    statusUpdates: 22,
    rank: 4,
    badge: "contributor",
    earnings: 62.0,
  },
  {
    id: "5",
    name: "Alex P.",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 480,
    binsReported: 5,
    statusUpdates: 18,
    rank: 5,
    badge: "contributor",
    earnings: 48.0,
  },
  {
    id: "6",
    name: "You",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 320,
    binsReported: 3,
    statusUpdates: 12,
    rank: 8,
    badge: "newbie",
    earnings: 32.5,
  },
]

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Scan Transport Receipts",
    description: "Scan and upload public transport receipts to help track carbon footprint data",
    reward: 2.5,
    type: "scan",
    icon: Scan,
    difficulty: "easy",
    estimatedTime: "2-3 mins",
    requirements: ["Clear photo of receipt", "Receipt must be from last 7 days"],
    completed: false,
    progress: 3,
    maxProgress: 10,
  },
  {
    id: "2",
    title: "Collect Paper Waste",
    description: "Collect and sell paper waste from your neighborhood for recycling",
    reward: 15.0,
    type: "collect",
    icon: Package,
    difficulty: "medium",
    estimatedTime: "30-45 mins",
    requirements: ["Minimum 5kg of paper", "Clean and dry paper only", "Delivery to collection point"],
    completed: false,
    progress: 2.5,
    maxProgress: 5,
  },
  {
    id: "3",
    title: "Report Illegal Dumping",
    description: "Take photos and report illegal waste dumping sites in your area",
    reward: 5.0,
    type: "report",
    icon: Camera,
    difficulty: "easy",
    estimatedTime: "5-10 mins",
    requirements: ["Clear photo with location", "GPS coordinates", "Description of waste type"],
    completed: true,
  },
  {
    id: "4",
    title: "Plastic Bottle Collection",
    description: "Collect plastic bottles and return them to recycling centers",
    reward: 8.0,
    type: "collect",
    icon: Recycle,
    difficulty: "easy",
    estimatedTime: "15-20 mins",
    requirements: ["Minimum 20 bottles", "Clean bottles only", "Valid recycling center receipt"],
    completed: false,
    progress: 15,
    maxProgress: 20,
  },
  {
    id: "5",
    title: "Waste Audit Survey",
    description: "Complete a detailed survey about waste management in your building",
    reward: 3.0,
    type: "survey",
    icon: CheckCircle2,
    difficulty: "easy",
    estimatedTime: "10-15 mins",
    requirements: ["Complete all survey questions", "Provide building details", "Submit photos if requested"],
    completed: false,
  },
  {
    id: "6",
    title: "Electronic Waste Drop-off",
    description: "Safely dispose of electronic waste at certified e-waste centers",
    reward: 12.0,
    type: "collect",
    icon: Zap,
    difficulty: "medium",
    estimatedTime: "20-30 mins",
    requirements: ["Valid e-waste items", "Certified disposal center", "Receipt of disposal"],
    completed: false,
    progress: 1,
    maxProgress: 3,
  },
]

export default function DustbinTracker() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [currentView, setCurrentView] = useState<"map" | "earn" | "profile">("map")

  const [dustbins, setDustbins] = useState<Dustbin[]>(mockDustbins)
  const [activeTab, setActiveTab] = useState("general")
  const [selectedBin, setSelectedBin] = useState<Dustbin | null>(null)
  const [isAddingBin, setIsAddingBin] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(mockLeaderboard)
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.006 })
  const [mapZoom, setMapZoom] = useState(13)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const mapRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])

  // Haptic feedback function
  const hapticFeedback = useCallback((type: "light" | "medium" | "heavy" = "light") => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
      }
      navigator.vibrate(patterns[type])
    }
  }, [])

  const handleLogin = (formData: FormData) => {
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    if (username === "admin" && password === "password") {
      setIsAuthenticated(true)
      setLoginError("")
      hapticFeedback("medium")
      toast({
        title: "Welcome!",
        description: "Successfully logged in to Dustbin Tracker",
      })
    } else {
      setLoginError("Invalid username or password")
      hapticFeedback("heavy")
    }
  }

  // Load Google Maps script
  useEffect(() => {
    if (!isAuthenticated) return

    const loadGoogleMaps = () => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        initializeMap()
        return
      }

      // Remove any existing scripts
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        existingScript.remove()
      }

      // Create script element with proper error handling
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDzep9Vx5ujii94g10cHt6nkdF_fRupFNs&callback=initMap`
      script.async = true
      script.defer = true

      // Set up global callback before adding script
      window.initGoogleMap = () => {
        console.log("Google Maps loaded successfully")
        initializeMap()
      }

      // Handle script load error
      script.onerror = (error) => {
        console.error("Failed to load Google Maps:", error)
        toast({
          title: "Maps Unavailable",
          description: "Using fallback map view",
        })
        setMap("fallback")
      }

      // Handle script load success
      script.onload = () => {
        console.log("Google Maps script loaded")
        // The callback will be called automatically
      }

      // Add script to document
      document.head.appendChild(script)

      // Timeout fallback
      setTimeout(() => {
        if (!window.google || !window.google.maps) {
          console.warn("Google Maps failed to load within timeout")
          setMap("fallback")
        }
      }, 10000) // 10 second timeout
    }

    const initializeMap = () => {
      if (!mapRef.current) {
        console.error("Map container not found")
        setMap("fallback")
        return
      }

      if (!window.google || !window.google.maps) {
        console.error("Google Maps API not available")
        setMap("fallback")
        return
      }

      try {
        console.log("Initializing Google Maps...")

        const mapOptions = {
          center: { lat: 40.7128, lng: -74.006 }, // NYC coordinates
          zoom: 13,
          styles: [
            {
              featureType: "all",
              elementType: "geometry",
              stylers: [{ color: "#f5f5f5" }],
            },
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#4d3215" }],
            },
            {
              featureType: "poi.park",
              elementType: "geometry.fill",
              stylers: [{ color: "#005031" }],
            },
            {
              featureType: "road",
              elementType: "geometry.fill",
              stylers: [{ color: "#ffffff" }],
            },
            {
              featureType: "water",
              elementType: "geometry.fill",
              stylers: [{ color: "#005031" }],
            },
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_CENTER,
          },
        }

        const newMap = new window.google.maps.Map(mapRef.current, mapOptions)
        setMap(newMap)

        console.log("Google Maps initialized successfully")

        // Get user location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }
              setUserLocation(userPos)

              // Add user location marker
              new window.google.maps.Marker({
                position: userPos,
                map: newMap,
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#005031",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 3,
                },
                title: "Your Location",
              })

              // Center map on user location
              newMap.setCenter(userPos)

              toast({
                title: "Location Found",
                description: "Map centered on your location",
              })
            },
            (error) => {
              console.error("Error getting location:", error)
              toast({
                title: "Location Access Denied",
                description: "Using default location (NYC)",
              })
            },
          )
        }

        toast({
          title: "Map Loaded",
          description: "Google Maps is ready to use",
        })
      } catch (error) {
        console.error("Error initializing map:", error)
        setMap("fallback")
        toast({
          title: "Map Error",
          description: "Using fallback map view",
        })
      }
    }

    // Start loading process
    console.log("Starting Google Maps load process...")
    loadGoogleMaps()

    // Cleanup function
    return () => {
      if (window.initGoogleMap) {
        delete window.initGoogleMap
      }
    }
  }, [isAuthenticated])

  // Update markers when dustbins or activeTab changes
  useEffect(() => {
    if (!map || map === "fallback") return

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null))

    const newMarkers: any[] = []
    const filteredBins = getFilteredBins()

    filteredBins.forEach((bin) => {
      const marker = new window.google.maps.Marker({
        position: { lat: bin.latitude, lng: bin.longitude },
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: getBinColor(bin),
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        title: bin.name,
      })

      // Add click listener
      marker.addListener("click", () => {
        setSelectedBin(bin)
      })

      newMarkers.push(marker)
    })

    setMarkers(newMarkers)
  }, [map, dustbins, activeTab])

  const getFilteredBins = () => {
    if (activeTab === "all") return dustbins
    return dustbins.filter((bin: Dustbin) => bin.type === activeTab)
  }

  const getBinIcon = (bin: Dustbin) => {
    const iconClass = "w-4 h-4"
    switch (bin.type) {
      case "recycling":
        return <Recycle className={iconClass} />
      case "organic":
        return <Leaf className={iconClass} />
      case "hazardous":
        return <Zap className={iconClass} />
      default:
        return <Trash2 className={iconClass} />
    }
  }

  const getBinColor = (bin: Dustbin) => {
    if (bin.status === "damaged" || bin.status === "missing") return "#ef4444"
    if (bin.status === "full") return "#f97316"
    if (bin.status === "half-full") return "#eab308"
    return "#005031"
  }

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "gold":
        return <Trophy className="w-4 h-4 text-yellow-500" />
      case "silver":
        return <Medal className="w-4 h-4 text-gray-400" />
      case "bronze":
        return <Award className="w-4 h-4 text-amber-600" />
      case "contributor":
        return <Star className="w-4 h-4 text-blue-500" />
      default:
        return <Star className="w-4 h-4 text-gray-400" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "hard":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleAddBin = (formData: FormData) => {
    const newBin: Dustbin = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      type: formData.get("type") as "general" | "recycling" | "organic" | "hazardous",
      status: "empty",
      latitude: userLocation?.lat || 40.7128,
      longitude: userLocation?.lng || -74.006,
      address: formData.get("address") as string,
      lastUpdated: new Date(),
      reportedBy: "You",
    }

    setDustbins([...dustbins, newBin])
    setIsAddingBin(false)
    hapticFeedback("medium")

    setLeaderboard((prev: LeaderboardUser[]) =>
      prev.map((user: LeaderboardUser) =>
        user.name === "You"
          ? { ...user, points: user.points + 50, binsReported: user.binsReported + 1, earnings: user.earnings + 5.0 }
          : user,
      ),
    )

    toast({
      title: "Dustbin Added",
      description: "New dustbin location has been successfully added. +50 points & $5.00!",
    })
  }

  const handleStatusUpdate = (binId: string, newStatus: string) => {
    setDustbins(
      dustbins.map((bin: Dustbin) =>
        bin.id === binId ? { ...bin, status: newStatus as any, lastUpdated: new Date(), reportedBy: "You" } : bin,
      ),
    )
    setSelectedBin(null)
    hapticFeedback("medium")

    setLeaderboard((prev: LeaderboardUser[]) =>
      prev.map((user: LeaderboardUser) =>
        user.name === "You"
          ? { ...user, points: user.points + 10, statusUpdates: user.statusUpdates + 1, earnings: user.earnings + 1.0 }
          : user,
      ),
    )

    toast({
      title: "Status Updated",
      description: `Dustbin status has been updated to ${newStatus}. +10 points & $1.00!`,
    })
  }

  const handleTaskComplete = (taskId: string) => {
    const task = tasks.find((t: Task) => t.id === taskId)
    if (!task) return

    setTasks((prev: Task[]) => prev.map((t: Task) => (t.id === taskId ? { ...t, completed: true } : t)))
    setSelectedTask(null)
    hapticFeedback("medium")

    setLeaderboard((prev: LeaderboardUser[]) =>
      prev.map((user: LeaderboardUser) =>
        user.name === "You"
          ? {
              ...user,
              points: user.points + Math.floor(task.reward * 10),
              earnings: user.earnings + task.reward,
            }
          : user,
      ),
    )

    toast({
      title: "Task Completed!",
      description: `You earned $${task.reward.toFixed(2)} and ${Math.floor(task.reward * 10)} points!`,
    })
  }

  const getLocalityStats = () => {
    const total = dustbins.length
    const needsAttention = dustbins.filter((bin: Dustbin) => bin.status === "full" || bin.status === "damaged").length
    return { total, needsAttention }
  }

  // Convert lat/lng to screen coordinates
  const latLngToScreen = (lat: number, lng: number) => {
    const mapBounds = {
      north: mapCenter.lat + 0.01 * mapZoom,
      south: mapCenter.lat - 0.01 * mapZoom,
      east: mapCenter.lng + 0.01 * mapZoom,
      west: mapCenter.lng - 0.01 * mapZoom,
    }

    const x = ((lng - mapBounds.west) / (mapBounds.east - mapBounds.west)) * 100
    const y = ((mapBounds.north - lat) / (mapBounds.north - mapBounds.south)) * 100

    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
  }

  // Handle map interactions
  const handleMapMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    setMapCenter((prev: { lat: number; lng: number }) => ({
      lat: prev.lat + deltaY * 0.0001,
      lng: prev.lng - deltaX * 0.0001,
    }))

    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMapMouseUp = () => {
    setIsDragging(false)
  }

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !touchStartRef.current) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y

    setMapCenter((prev: { lat: number; lng: number }) => ({
      lat: prev.lat + deltaY * 0.0001,
      lng: prev.lng - deltaX * 0.0001,
    }))

    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    touchStartRef.current = null
  }

  const stats = getLocalityStats()
  const currentUser = leaderboard.find((user: LeaderboardUser) => user.name === "You")
  const completedTasks = tasks.filter((task: Task) => task.completed).length
  const totalEarnings = currentUser?.earnings || 0

  const LoginForm = () => (
    <div className="min-h-screen bg-[#fdfbfe] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm rounded-2xl shadow-lg border-gray-200">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="bg-[#005031] rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#4d3215] mb-1">Dustbin Tracker</h1>
            <p className="text-xs text-gray-600">Sign in to track dustbins and earn money</p>
          </div>

          <form action={handleLogin} className="space-y-3">
            <div>
              <Label htmlFor="username" className="text-[#4d3215] text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                required
                className="mt-1 border-[#b38948] focus:border-[#005031] rounded-xl bg-white text-[#4d3215] placeholder-gray-400 h-10"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-[#4d3215] text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                className="mt-1 border-[#b38948] focus:border-[#005031] rounded-xl bg-white text-[#4d3215] placeholder-gray-400 h-10"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-2">
                <p className="text-red-600 text-xs">{loginError}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#005031] hover:bg-[#004028] rounded-xl py-2 text-white font-medium h-10"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-600 text-center mb-1">Demo Credentials:</p>
            <p className="text-xs text-gray-700 text-center">
              <span className="font-medium">Username:</span> admin
              <br />
              <span className="font-medium">Password:</span> password
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const FilterButtons = () => (
    <div className="flex flex-wrap gap-2">
      {[
        { key: "general", icon: Trash2, label: "GENERAL", shortLabel: "GEN" },
        { key: "recycling", icon: Recycle, label: "RECYCLE", shortLabel: "REC" },
        { key: "organic", icon: Leaf, label: "BIO GAS", shortLabel: "BIO" },
        { key: "hazardous", icon: Zap, label: "HAZARDOUS", shortLabel: "HAZ" },
      ].map(({ key, icon: Icon, label, shortLabel }) => (
        <Button
          key={key}
          variant={activeTab === key ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setActiveTab(key)
            hapticFeedback("light")
          }}
          className={`text-xs sm:text-sm rounded-xl h-10 px-3 ${
            activeTab === key
              ? "bg-[#4d3215] hover:bg-[#3d2811] text-white shadow-lg border-[#4d3215]"
              : "border-[#b38948] text-[#4d3215] hover:bg-[#b38948] hover:text-white bg-white"
          }`}
        >
          <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="hidden xs:inline">{label}</span>
          <span className="xs:hidden">{shortLabel}</span>
        </Button>
      ))}
    </div>
  )

  const GoogleMap = () => (
    <div className="w-full h-full rounded-2xl shadow-lg relative overflow-hidden bg-gray-100">
      <div
        ref={mapRef}
        className="w-full h-full rounded-2xl"
        style={{
          minHeight: "500px",
          height: "100%",
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        }}
      />

      {/* Loading state */}
      {!map && (
        <div className="absolute inset-0 bg-white flex items-center justify-center rounded-2xl">
          <div className="text-center p-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#005031] mx-auto mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-[#005031]" />
              </div>
            </div>
            <p className="text-[#4d3215] text-lg font-medium">Loading Google Maps...</p>
            <p className="text-gray-600 text-sm mt-2">Please wait while we initialize the map</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-[#005031] rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-[#b38948] rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-[#005031] rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Fallback state */}
      {map === "fallback" && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 flex flex-col rounded-2xl">
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md w-full">
              <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-[#4d3215] text-lg font-semibold mb-2">Maps Unavailable</h3>
              <p className="text-gray-600 text-sm mb-4">
                Unable to load Google Maps. Here's a list of nearby dustbins instead.
              </p>

              {/* Fallback: Show dustbin list */}
              <div className="max-h-80 overflow-y-auto bg-white rounded-xl p-4 shadow-inner">
                <div className="space-y-3">
                  {getFilteredBins().length === 0 ? (
                    <div className="text-center py-8">
                      <Trash2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No dustbins found for the selected filter.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("general")}
                        className="mt-3 rounded-xl"
                      >
                        Show All Bins
                      </Button>
                    </div>
                  ) : (
                    getFilteredBins().map((bin) => (
                      <Card
                        key={bin.id}
                        className="text-left cursor-pointer hover:bg-gray-50 transition-colors border-l-4"
                        style={{ borderLeftColor: getBinColor(bin) }}
                        onClick={() => {
                          setSelectedBin(bin)
                          hapticFeedback("light")
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm"
                              style={{ backgroundColor: getBinColor(bin) }}
                            >
                              {getBinIcon(bin)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-[#4d3215] truncate">{bin.name}</div>
                              <div className="text-xs text-gray-600 truncate">{bin.address}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                Updated {bin.lastUpdated.toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge className="bg-[#005031] text-white text-xs">
                                {bin.type.charAt(0).toUpperCase() + bin.type.slice(1)}
                              </Badge>
                              <Badge
                                className={`text-xs ${
                                  bin.status === "empty"
                                    ? "bg-green-100 text-green-800"
                                    : bin.status === "full"
                                      ? "bg-red-100 text-red-800"
                                      : bin.status === "damaged"
                                        ? "bg-orange-100 text-orange-800"
                                        : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {bin.status.replace("-", " ")}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Retry button */}
              <Button
                variant="outline"
                onClick={() => {
                  setMap(null)
                  // Remove existing script and reload
                  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
                  if (existingScript) {
                    existingScript.remove()
                  }
                  // Clear the callback
                  if (window.initGoogleMap) {
                    delete window.initGoogleMap
                  }
                  // Reload the page to retry
                  window.location.reload()
                }}
                className="mt-4 rounded-xl border-[#005031] text-[#005031] hover:bg-[#005031] hover:text-white"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Retry Loading Maps
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Map controls overlay - only show when map is loaded */}
      {map && map !== "fallback" && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <Button
            size="sm"
            variant="outline"
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg hover:bg-white"
            onClick={() => {
              if (map && map.getZoom) {
                map.setZoom(map.getZoom() + 1)
              }
              hapticFeedback("light")
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg hover:bg-white"
            onClick={() => {
              if (map && map.getZoom) {
                map.setZoom(map.getZoom() - 1)
              }
              hapticFeedback("light")
            }}
          >
            <span className="text-lg font-bold">−</span>
          </Button>
          {userLocation && (
            <Button
              size="sm"
              variant="outline"
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg hover:bg-white"
              onClick={() => {
                if (map && map.setCenter) {
                  map.setCenter(userLocation)
                  map.setZoom(15)
                }
                hapticFeedback("light")
                toast({
                  title: "Location Centered",
                  description: "Map centered on your location",
                })
              }}
            >
              <MapPin className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )

  const EarnView = () => (
    <div className="flex-1 p-4 pb-20">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#4d3215] mb-4">Available Tasks</h3>

        {tasks.map((task) => (
          <Card
            key={task.id}
            className={`cursor-pointer hover:shadow-md transition-all rounded-2xl border-gray-200 ${
              task.completed ? "opacity-60 bg-gray-50" : ""
            }`}
            onClick={() => {
              if (!task.completed) {
                setSelectedTask(task)
                hapticFeedback("light")
              }
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${
                    task.completed ? "bg-gray-400" : "bg-[#005031]"
                  }`}
                >
                  {task.completed ? <CheckCircle className="w-6 h-6" /> : <task.icon className="w-6 h-6" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-[#4d3215] truncate">{task.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-green-600">${task.reward.toFixed(2)}</div>
                      <Badge className={`text-xs ${getDifficultyColor(task.difficulty)}`}>{task.difficulty}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.estimatedTime}
                    </div>
                    {task.completed && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </div>
                    )}
                  </div>

                  {/* Progress bar for ongoing tasks */}
                  {task.progress !== undefined && task.maxProgress && !task.completed && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>
                          {task.progress}/{task.maxProgress}
                        </span>
                      </div>
                      <Progress value={(task.progress / task.maxProgress) * 100} className="h-2" />
                    </div>
                  )}
                </div>

                {!task.completed && <ArrowRight className="w-5 h-5 text-gray-400 mt-2" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const ProfileView = () => (
    <div className="flex-1 p-4 pb-20">
      <div className="space-y-6">
        {/* User Stats */}
        {currentUser && (
          <Card className="rounded-2xl border-[#b38948] bg-gradient-to-r from-[#005031] to-[#b38948]">
            <CardContent className="p-6 text-white">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-white">
                  <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                  <AvatarFallback className="bg-white text-[#4d3215] font-bold">
                    {currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-xl font-bold">{currentUser.name}</div>
                  <div className="text-white/80">Rank #{currentUser.rank}</div>
                  <div className="flex items-center gap-2 mt-2">
                    {getBadgeIcon(currentUser.badge)}
                    <span className="text-sm capitalize">{currentUser.badge}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{currentUser.points}</div>
                  <div className="text-white/80 text-sm">Points</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#005031]">${totalEarnings.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Earned</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#b38948]">{completedTasks}</div>
              <div className="text-sm text-gray-600">Tasks Done</div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#005031]">{currentUser?.binsReported || 0}</div>
              <div className="text-sm text-gray-600">Bins Reported</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#b38948]">{currentUser?.statusUpdates || 0}</div>
              <div className="text-sm text-gray-600">Status Updates</div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Preview */}
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#4d3215]">Leaderboard</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowLeaderboard(true)
                  hapticFeedback("light")
                }}
                className="rounded-xl"
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {leaderboard
                .sort((a, b) => b.points - a.points)
                .slice(0, 3)
                .map((user, index) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="text-xs">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-[#4d3215]">{user.name}</div>
                      <div className="text-xs text-gray-600">${user.earnings.toFixed(2)} earned</div>
                    </div>
                    <div className="text-sm font-bold text-[#005031]">{user.points}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full rounded-2xl h-12 border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
          onClick={() => {
            setIsAuthenticated(false)
            setLoginError("")
            hapticFeedback("medium")
            toast({
              title: "Logged Out",
              description: "You have been successfully logged out",
            })
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  )

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />
  }

  // Show main app if authenticated
  return (
    <div className="min-h-screen bg-[#fdfbfe] flex flex-col">
      {/* Top Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          {/* Mobile Filter Button - Only show on map view */}
          {currentView === "map" && (
            <div className="flex items-center gap-2 sm:hidden">
              <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-[#b38948] bg-white text-[#4d3215] hover:bg-[#b38948] hover:text-white h-10 w-10"
                    onClick={() => hapticFeedback("light")}
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] rounded-r-2xl bg-white border-gray-200 text-[#4d3215]">
                  <SheetHeader>
                    <SheetTitle className="text-[#4d3215]">Filter Dustbins</SheetTitle>
                    <SheetDescription className="text-gray-600">
                      Choose the type of dustbins to display.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterButtons />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}

          {/* Desktop Filter Buttons - Only show on map view */}
          {currentView === "map" && (
            <div className="hidden sm:flex">
              <FilterButtons />
            </div>
          )}

          {/* View Title for non-map views */}
          {currentView !== "map" && (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-[#4d3215] capitalize">{currentView}</h1>
            </div>
          )}

          {/* User Points & Actions */}
          <div className="flex items-center gap-2">
            {/* User Points */}
            {currentUser && (
              <div className="flex items-center gap-1 bg-[#005031] px-3 py-2 rounded-xl">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">{totalEarnings.toFixed(2)}</span>
              </div>
            )}

            {/* Add Button - Only show on map view */}
            {currentView === "map" && (
              <Dialog open={isAddingBin} onOpenChange={setIsAddingBin}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-[#b38948] hover:bg-[#a67c3a] rounded-xl shadow-lg h-10 w-10"
                    onClick={() => hapticFeedback("light")}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md mx-auto rounded-2xl bg-white border-gray-200 text-[#4d3215]">
                  <DialogHeader>
                    <DialogTitle className="text-[#4d3215]">Add New Dustbin</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Add a new dustbin location to help others in your community. (+50 points & $5.00)
                    </DialogDescription>
                  </DialogHeader>
                  <form action={handleAddBin} className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-[#4d3215]">
                        Bin Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g., Main Street Bin #1"
                        required
                        className="border-[#b38948] focus:border-[#005031] rounded-xl bg-white text-[#4d3215] placeholder-gray-400 h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type" className="text-[#4d3215]">
                        Bin Type
                      </Label>
                      <Select name="type" required>
                        <SelectTrigger className="border-[#b38948] focus:border-[#005031] rounded-xl bg-white text-[#4d3215] h-12">
                          <SelectValue placeholder="Select bin type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white border-gray-200 text-[#4d3215]">
                          <SelectItem value="general">General Waste</SelectItem>
                          <SelectItem value="recycling">Recycling</SelectItem>
                          <SelectItem value="organic">Organic</SelectItem>
                          <SelectItem value="hazardous">Hazardous</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-[#4d3215]">
                        Address
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        placeholder="Street address or landmark"
                        required
                        className="border-[#b38948] focus:border-[#005031] rounded-xl bg-white text-[#4d3215] placeholder-gray-400 h-12"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddingBin(false)}
                        className="rounded-xl border-gray-300 text-gray-600 hover:bg-gray-100 h-12"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-[#005031] hover:bg-[#004028] rounded-xl h-12"
                        onClick={() => hapticFeedback("medium")}
                      >
                        Add Dustbin
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {currentView === "map" && <GoogleMap />}
        {currentView === "earn" && <EarnView />}
        {currentView === "profile" && <ProfileView />}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 sticky bottom-0 z-40">
        <div className="flex items-center justify-around">
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-1 h-12 px-3 rounded-xl ${
              currentView === "map" ? "bg-[#005031] text-white" : "text-gray-600"
            }`}
            onClick={() => {
              setCurrentView("map")
              hapticFeedback("light")
            }}
          >
            <Map className="w-5 h-5" />
            <span className="text-xs">Map</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-1 h-12 px-3 rounded-xl ${
              currentView === "earn" ? "bg-[#005031] text-white" : "text-gray-600"
            }`}
            onClick={() => {
              setCurrentView("earn")
              hapticFeedback("light")
            }}
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-xs">Earn</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 h-12 px-3 rounded-xl text-yellow-600"
            onClick={() => {
              setShowLeaderboard(true)
              hapticFeedback("light")
            }}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-xs">Ranks</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-1 h-12 px-3 rounded-xl ${
              currentView === "profile" ? "bg-[#005031] text-white" : "text-gray-600"
            }`}
            onClick={() => {
              setCurrentView("profile")
              hapticFeedback("light")
            }}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>

      {/* Locality Stats - Only show on map view */}
      {currentView === "map" && (
        <div className="absolute bottom-20 left-4 right-4 z-30">
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-[#005031] bg-[#005031]/90 backdrop-blur-sm rounded-2xl shadow-lg">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-white">{stats.total}</div>
                  <div className="text-xs text-gray-200 uppercase tracking-wide">Total Bins</div>
                </div>
                <div className="bg-[#b38948] rounded-full p-2 shadow-lg">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-600 bg-orange-600/90 backdrop-blur-sm rounded-2xl shadow-lg">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-white">{stats.needsAttention}</div>
                  <div className="text-xs text-gray-200 uppercase tracking-wide">Need Attention</div>
                </div>
                <div className="bg-[#b38948] rounded-full p-2 shadow-lg">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="w-[95vw] max-w-md mx-auto rounded-2xl bg-white border-gray-200 text-[#4d3215]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[#4d3215]">
                <selectedTask.icon className="w-5 h-5" />
                {selectedTask.title}
              </DialogTitle>
              <DialogDescription className="text-gray-600">{selectedTask.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-green-600">${selectedTask.reward.toFixed(2)}</div>
                <Badge className={`${getDifficultyColor(selectedTask.difficulty)}`}>{selectedTask.difficulty}</Badge>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Estimated Time: {selectedTask.estimatedTime}</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-[#4d3215]">Requirements:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {selectedTask.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-[#005031] mt-1">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {selectedTask.progress !== undefined && selectedTask.maxProgress && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Current Progress</span>
                    <span>
                      {selectedTask.progress}/{selectedTask.maxProgress}
                    </span>
                  </div>
                  <Progress value={(selectedTask.progress / selectedTask.maxProgress) * 100} className="h-3" />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTask(null)}
                  className="flex-1 rounded-xl border-gray-300 text-gray-600 hover:bg-gray-100 h-12"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleTaskComplete(selectedTask.id)}
                  className="flex-1 bg-[#005031] hover:bg-[#004028] rounded-xl h-12"
                >
                  Complete Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Leaderboard Modal */}
      <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
        <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[80vh] overflow-y-auto rounded-2xl bg-white border-gray-200 text-[#4d3215]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#4d3215]">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Community Leaderboard
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Top earners helping keep our community clean
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Earnings Legend */}
            <Card className="bg-[#005031] bg-opacity-10 border-[#005031] border-opacity-30 rounded-2xl">
              <CardContent className="p-4">
                <div className="text-xs text-[#4d3215] space-y-1">
                  <div className="flex justify-between">
                    <span>Report new dustbin:</span>
                    <span className="font-medium">+50 points & $5.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Update bin status:</span>
                    <span className="font-medium">+10 points & $1.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Complete tasks:</span>
                    <span className="font-medium">Varies by task</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard List */}
            <div className="space-y-3">
              {leaderboard
                .sort((a, b) => b.earnings - a.earnings)
                .map((user, index) => (
                  <Card
                    key={user.id}
                    className={`rounded-2xl ${user.name === "You" ? "bg-[#b38948] bg-opacity-20 border-[#b38948]" : "bg-gray-50 border-gray-200"}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-500 w-6">#{index + 1}</span>
                            {getBadgeIcon(user.badge)}
                          </div>
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback className="text-xs bg-gray-200 text-[#4d3215]">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm flex items-center gap-2 text-[#4d3215]">
                              {user.name}
                              {user.name === "You" && (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-2 py-0 rounded-lg border-[#b38948] text-[#b38948]"
                                >
                                  You
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">
                              {user.binsReported} bins • {user.statusUpdates} updates
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm text-green-600">${user.earnings.toFixed(2)}</div>
                          <div className="text-xs text-gray-600">{user.points} pts</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bin Details Modal */}
      {selectedBin && (
        <Dialog open={!!selectedBin} onOpenChange={() => setSelectedBin(null)}>
          <DialogContent className="w-[95vw] max-w-md mx-auto rounded-2xl bg-white border-gray-200 text-[#4d3215]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-sm sm:text-base text-[#4d3215]">
                {getBinIcon(selectedBin)}
                {selectedBin.name}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-gray-600">{selectedBin.address}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-[#005031] text-white border-[#005031] text-xs rounded-lg">
                  {selectedBin.type.charAt(0).toUpperCase() + selectedBin.type.slice(1)}
                </Badge>
                <Badge
                  className={`text-xs rounded-lg ${
                    selectedBin.status === "empty"
                      ? "bg-green-600 text-white border-green-500"
                      : selectedBin.status === "full"
                        ? "bg-red-600 text-white border-red-500"
                        : selectedBin.status === "damaged"
                          ? "bg-orange-600 text-white border-orange-500"
                          : "bg-yellow-600 text-white border-yellow-500"
                  }`}
                >
                  {selectedBin.status.charAt(0).toUpperCase() + selectedBin.status.slice(1).replace("-", " ")}
                </Badge>
              </div>

              <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                <p>Last updated: {selectedBin.lastUpdated.toLocaleDateString()}</p>
                {selectedBin.reportedBy && <p>Reported by: {selectedBin.reportedBy}</p>}
              </div>

              <div>
                <Label className="text-xs sm:text-sm font-medium text-[#4d3215]">
                  Update Status (+10 points & $1.00)
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {["empty", "half-full", "full", "damaged"].map((status) => (
                    <Button
                      key={status}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleStatusUpdate(selectedBin.id, status)
                        hapticFeedback("medium")
                      }}
                      className="justify-start text-xs h-12 rounded-xl border-[#b38948] hover:bg-[#b38948] hover:text-white bg-white text-[#4d3215]"
                    >
                      {status === "empty" && <CheckCircle className="w-3 h-3 mr-1" />}
                      {status === "damaged" && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {(status === "half-full" || status === "full") && <MapPin className="w-3 h-3 mr-1" />}
                      <span className="capitalize">{status.replace("-", " ")}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
