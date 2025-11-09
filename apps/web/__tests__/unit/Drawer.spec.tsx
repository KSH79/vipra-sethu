// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Drawer } from '@/components/ui/Drawer'

describe.skip('Drawer component (skipped due to jsdom ESM parsing issue)', () => {
  const onClose = vi.fn()
  beforeEach(() => onClose.mockReset())

  it('focuses the drawer panel when opened', async () => {
    render(
      <Drawer isOpen onClose={onClose}>
        <div>Content</div>
      </Drawer>
    )
    const dialog = await screen.findByRole('dialog')
    // allow microtask queue to run focus effect
    await new Promise(r => setTimeout(r, 0))
    expect(document.activeElement).toBe(dialog)
  })

  it('does not close on backdrop click', async () => {
    render(
      <Drawer isOpen onClose={onClose}>
        <div>Content</div>
      </Drawer>
    )
    const backdrop = document.querySelector('[aria-hidden="true"]') as HTMLElement
    expect(backdrop).toBeTruthy()
    fireEvent.click(backdrop)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not close on Escape key', async () => {
    render(
      <Drawer isOpen onClose={onClose}>
        <div>Content</div>
      </Drawer>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})
