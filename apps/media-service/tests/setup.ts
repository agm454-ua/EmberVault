import './httpMocks.js'
import { resetHttpServiceMocks } from './httpMocks.js'
import { afterEach, vi } from 'vitest'

afterEach(() => {
    vi.clearAllMocks()
    resetHttpServiceMocks()
})
