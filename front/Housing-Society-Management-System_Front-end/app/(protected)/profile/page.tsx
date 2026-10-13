'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/context/ToastContext'
import { apiClient } from '@/lib/API/client'
import { setUser } from '@/lib/store/slices/authSlice'
import { RootState } from '@/lib/store/store'
import { User, UserNotificationPrefs } from '@/lib/types/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { z } from 'zod'

import { UploadAvatar } from '@/components/shared/UploadAvatar/UploadAvatar'
import { usePushSubscription } from '@/lib/hooks/usePushSubscription'

const profileSchema = z.object({
  firstName: z.string().min(2, 'At least 2 characters').max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().max(500).optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { showToast } = useToast()
  const user = useSelector((state: RootState) => state.auth.user)
  const [avatar, setAvatar] = useState(user?.avatar ?? '')
  const [saving, setSaving] = useState(false)
  const { subscribe: subscribePush, status: pushStatus } = usePushSubscription()
  const [notificationPrefs, setNotificationPrefs] = useState<UserNotificationPrefs>({
    inApp: true,
    email: true,
    push: true,
    sms: false,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      address: user?.address ?? '',
      bio: user?.bio ?? '',
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        address: user.address ?? '',
        bio: user.bio ?? '',
      })
      setAvatar(user.avatar ?? '')
      setNotificationPrefs(
        user.preferences?.notifications ?? { inApp: true, email: true, push: true, sms: false }
      )
    }
  }, [user, reset])

  const onSave = useCallback(
    async (data: ProfileForm) => {
      if (!user?.id) return
      setSaving(true)
      try {
        const res = await apiClient.updateProfile({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || undefined,
          address: data.address || undefined,
          bio: data.bio || undefined,
          avatar: avatar || undefined,
          preferences: {
            ...user.preferences,
            notifications: notificationPrefs,
          },
        })
        if (res.data.data) {
          dispatch(setUser(res.data.data as User))
        }
        showToast('Profile updated successfully', 'success')
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Update failed', 'error')
      } finally {
        setSaving(false)
      }
    },
    [user, avatar, notificationPrefs, dispatch, showToast]
  )

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-6 px-4">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-xl font-semibold text-white">Profile</h1>
          <p className="text-sm text-gray-400">Manage your account and preferences</p>
        </motion.div>

        <form
          onSubmit={handleSubmit(onSave, (err) => {
            showToast('Please fix the validation errors', 'error')
          })}
          className="flex flex-col gap-6 lg:flex-row lg:gap-6"
        >
          {/* Left: Avatar + Info */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 space-y-4"
          >
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6 shadow-2xl backdrop-blur-xl">
              <h2 className="mb-4 text-sm font-medium text-white/90">Profile Info</h2>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="shrink-0">
                  <UploadAvatar
                    value={avatar}
                    onChange={setAvatar}
                    userId={user.id}
                    size="lg"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm text-gray-300">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        {...register('firstName')}
                        className="border-white/10 bg-black/30 text-sm text-white"
                      />
                      {errors.firstName && (
                        <p className="text-xs text-red-400">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm text-gray-300">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        {...register('lastName')}
                        className="border-white/10 bg-black/30 text-sm text-white"
                      />
                      {errors.lastName && (
                        <p className="text-xs text-red-400">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      className="border-white/10 bg-black/30 text-sm text-white"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm text-gray-300">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      className="border-white/10 bg-black/30 text-sm text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm text-gray-300">
                      Address
                    </Label>
                    <Input
                      id="address"
                      {...register('address')}
                      className="border-white/10 bg-black/30 text-sm text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm text-gray-300">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      {...register('bio')}
                      rows={3}
                      className="resize-none border-white/10 bg-black/30 text-sm text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Notification prefs */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:w-80"
          >
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6 shadow-2xl backdrop-blur-xl">
              <h2 className="mb-4 text-sm font-medium text-white/90">
                Notification Preferences
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-300">In-app (real-time)</Label>
                  <Switch
                    checked={notificationPrefs.inApp ?? true}
                    onCheckedChange={(v) =>
                      setNotificationPrefs((p) => ({ ...p, inApp: v }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-300">Email</Label>
                  <Switch
                    checked={notificationPrefs.email ?? true}
                    onCheckedChange={(v) =>
                      setNotificationPrefs((p) => ({ ...p, email: v }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-300">Push (background)</Label>
                  <Switch
                    checked={notificationPrefs.push ?? true}
                    onCheckedChange={(v) =>
                      setNotificationPrefs((p) => ({ ...p, push: v }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-300">SMS</Label>
                  <Switch
                    checked={notificationPrefs.sms ?? false}
                    onCheckedChange={(v) =>
                      setNotificationPrefs((p) => ({ ...p, sms: v }))
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={subscribePush}
                  disabled={pushStatus === 'requesting' || pushStatus === 'subscribed'}
                  className="mt-2 w-full border-white/10 text-xs"
                >
                  {pushStatus === 'requesting'
                    ? 'Requesting…'
                    : pushStatus === 'subscribed'
                      ? 'Push enabled'
                      : pushStatus === 'denied'
                        ? 'Permission denied'
                        : 'Enable push notifications'}
                </Button>
              </div>
            </div>

            <Button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit(onSave, () => showToast('Please fix the validation errors', 'error'))()}
              className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Save Profile'
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  )
}
