'use client'

import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useLocation, useNavigate } from 'react-router-dom';

const navigation = [
  { name: 'Portfolio', path: '/', current: false },
  { name: 'Trade', path: '/trade', current: false },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Example({ children }: { children: React.ReactNode }) {
    
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <div>
        <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                  <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon aria-hidden="true" className="h-6 w-6 text-white" />
                  </button>
                </div>
              </TransitionChild>
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/10">
                <div className="flex h-16 shrink-0 items-center gap-5">
                  <span className="ml-2 text-white text-4xl">🤖</span>
                  <span className="text-white text-2xl font-bold">SellScaleHood</span>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <div
                              onClick={() => navigate(item.path)}
                              className={classNames(
                                location.pathname === item.path
                                  ? 'bg-gray-800 text-white'
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                                'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 w-full',
                              )}
                            >
                              {item.name}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </nav>
                <li className="-mx-6 mt-auto">
                  <div
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-indigo-700 w-full"
                  >
                    <div className="h-8 w-8 rounded-full bg-indigo-700 flex items-center justify-center p-1">
                      <span className="text-white text-sm font-bold">AA</span>
                    </div>
                    <span className="sr-only">Your profile</span>
                    <span aria-hidden="true">Aakash Adesara</span>
                  </div>
                </li>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-60 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6">
            <div className="flex h-16 shrink-0 items-center justify-between gap-3 mt-5">
              <span className="text-white text-4xl">🤖</span>
              <span className="text-white text-xl font-bold">SellScaleHood</span>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <div
                          onClick={() => navigate(item.path)}
                          className={classNames(
                            location.pathname === item.path
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                            'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 w-full',
                          )}
                        >
                          {item.name}
                        </div>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
            <li className="-mx-6 mt-auto">
              <div
                onClick={() => navigate('/profile')}
                className="flex items-center gap-x-4 px-6 py-5 text-sm font-semibold leading-6 text-white hover:bg-indigo-700 w-full"
              >
                <div className="h-8 w-8 rounded-full bg-indigo-700 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AA</span>
                </div>
                <span className="sr-only">Your profile</span>
                <span aria-hidden="true">Aakash Adesara</span>
              </div>
            </li>
          </div>
        </div>

        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-400 lg:hidden">
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-white">Portfolio</div>
        </div>

        <main className="py-10 lg:pl-60 bg-gray-100 min-h-dvh">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </>
  )
}
