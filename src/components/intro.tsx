/**
 * Copyright (c) 2025 Kiril Strezikozin
 *
 * SPDX-License-Identifier: MIT
 *
 * You may not use this file except in compliance with the MIT license terms.
 */

export default function Intro(
  { title, description }: { title: string, description: string }
) {
  return (
    <>
      <h1 className='text-center sm:text-left mb-4 text-5xl font-black'>
        {title}
      </h1>
      <p className='text-center sm:text-left'>
        {description}
      </p>
    </>
  );
}