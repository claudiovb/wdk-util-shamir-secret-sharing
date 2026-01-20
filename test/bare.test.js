/* eslint-disable no-console */
import { split, combine } from 'wdk-util-shamir-secret-sharing'

// Test mnemonics (these are well-known test vectors, NOT for production use)
const TEST_MNEMONIC_12 = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
const TEST_MNEMONIC_24 = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art'

async function runTests() {
  console.log('Starting Bare runtime tests...\n')

  // Test 1: Basic split functionality
  console.log('Test 1: Split a 12-word mnemonic into shares')
  try {
    const shares = await split(TEST_MNEMONIC_12, { shares: 5, threshold: 3 })
    console.log('✓ Split successful')
    console.log(`  - Created ${shares.length} shares`)
    console.log(`  - Share 1 (first 50 chars): ${shares[0].substring(0, 50)}...`)
    console.log(`  - All shares are hex strings: ${shares.every(s => /^[0-9a-f]+$/i.test(s))}`)
  } catch (error) {
    console.error('✗ Test 1 failed:', error.message)
    process.exit(1)
  }

  // Test 2: Basic combine functionality
  console.log('\nTest 2: Combine shares to reconstruct mnemonic')
  try {
    const shares = await split(TEST_MNEMONIC_12, { shares: 5, threshold: 3 })
    const reconstructed = await combine(shares)

    if (reconstructed === TEST_MNEMONIC_12) {
      console.log('✓ Combine successful')
      console.log(`  - Original: ${TEST_MNEMONIC_12}`)
      console.log(`  - Reconstructed: ${reconstructed}`)
      console.log(`  - Match: ${reconstructed === TEST_MNEMONIC_12}`)
    } else {
      throw new Error('Reconstructed mnemonic does not match original')
    }
  } catch (error) {
    console.error('✗ Test 2 failed:', error.message)
    process.exit(1)
  }

  // Test 3: Threshold reconstruction
  console.log('\nTest 3: Reconstruct from threshold number of shares (3 out of 5)')
  try {
    const shares = await split(TEST_MNEMONIC_12, { shares: 5, threshold: 3 })
    const reconstructed = await combine(shares.slice(0, 3))

    if (reconstructed === TEST_MNEMONIC_12) {
      console.log('✓ Threshold reconstruction successful')
      console.log('  - Used 3 out of 5 shares')
      console.log(`  - Reconstructed correctly: ${reconstructed === TEST_MNEMONIC_12}`)
    } else {
      throw new Error('Threshold reconstruction failed')
    }
  } catch (error) {
    console.error('✗ Test 3 failed:', error.message)
    process.exit(1)
  }

  // Test 4: Different subsets of shares
  console.log('\nTest 4: Reconstruct from different subsets of shares')
  try {
    const shares = await split(TEST_MNEMONIC_12, { shares: 5, threshold: 3 })

    const combo1 = await combine([shares[0], shares[2], shares[4]])
    const combo2 = await combine([shares[1], shares[3], shares[4]])

    if (combo1 === TEST_MNEMONIC_12 && combo2 === TEST_MNEMONIC_12) {
      console.log('✓ Different subsets work correctly')
      console.log(`  - Combo 1 (shares 0,2,4): ${combo1 === TEST_MNEMONIC_12}`)
      console.log(`  - Combo 2 (shares 1,3,4): ${combo2 === TEST_MNEMONIC_12}`)
    } else {
      throw new Error('Different subsets failed')
    }
  } catch (error) {
    console.error('✗ Test 4 failed:', error.message)
    process.exit(1)
  }

  // Test 5: 24-word mnemonic
  console.log('\nTest 5: Split and combine 24-word mnemonic')
  try {
    const shares = await split(TEST_MNEMONIC_24, { shares: 3, threshold: 2 })
    const reconstructed = await combine(shares)

    if (reconstructed === TEST_MNEMONIC_24) {
      console.log('✓ 24-word mnemonic test successful')
      console.log(`  - Created ${shares.length} shares`)
      console.log(`  - Reconstructed correctly: ${reconstructed === TEST_MNEMONIC_24}`)
    } else {
      throw new Error('24-word mnemonic reconstruction failed')
    }
  } catch (error) {
    console.error('✗ Test 5 failed:', error.message)
    process.exit(1)
  }

  // Test 6: Error handling - invalid shares count
  console.log('\nTest 6: Error handling - invalid shares count')
  try {
    await split(TEST_MNEMONIC_12, { shares: 1, threshold: 1 })
    console.error('✗ Test 6 failed: Should have thrown an error')
    process.exit(1)
  } catch (error) {
    if (error.message === 'shares must be at least 2') {
      console.log('✓ Correctly validates shares count')
      console.log(`  - Error: ${error.message}`)
    } else {
      console.error('✗ Test 6 failed: Wrong error message')
      process.exit(1)
    }
  }

  // Test 7: Error handling - invalid threshold
  console.log('\nTest 7: Error handling - invalid threshold')
  try {
    await split(TEST_MNEMONIC_12, { shares: 3, threshold: 5 })
    console.error('✗ Test 7 failed: Should have thrown an error')
    process.exit(1)
  } catch (error) {
    if (error.message === 'threshold cannot be greater than shares') {
      console.log('✓ Correctly validates threshold')
      console.log(`  - Error: ${error.message}`)
    } else {
      console.error('✗ Test 7 failed: Wrong error message')
      process.exit(1)
    }
  }

  // Test 8: Round-trip test with multiple iterations
  console.log('\nTest 8: Multiple round-trip tests')
  try {
    for (let i = 0; i < 3; i++) {
      const shares = await split(TEST_MNEMONIC_12, { shares: 5, threshold: 3 })
      const reconstructed = await combine(shares.slice(0, 3))

      if (reconstructed !== TEST_MNEMONIC_12) {
        throw new Error(`Round-trip ${i + 1} failed`)
      }
    }
    console.log('✓ Multiple round-trip tests successful')
    console.log('  - All 3 iterations passed')
  } catch (error) {
    console.error('✗ Test 8 failed:', error.message)
    process.exit(1)
  }

  console.log('\n' + '='.repeat(50))
  console.log('All tests passed! ✓')
  console.log('='.repeat(50))
}

runTests().catch((error) => {
  console.error('Unexpected error:', error)
  process.exit(1)
})
