/**
 * Check Liquidity Status
 * Quick script to view current liquidity reserves and alerts
 */

import { getLiquidityService } from '@/lib/liquidity/liquidity-service';
import { getPSPAssignmentStats, calculateRevenueImpact } from '@/lib/routing/smart-psp-routing';

async function main() {
  console.log('💰 NEDAplus Liquidity Status\n');
  console.log('='.repeat(60));

  const liquidityService = getLiquidityService();

  try {
    // Step 1: Show all reserves
    console.log('\n📊 Currency Reserves:');
    console.log('-'.repeat(60));

    const reserves = await liquidityService.getAllReserves();
    
    if (reserves.length === 0) {
      console.log('⚠️  No liquidity reserves configured');
      console.log('   Run: npm run liquidity:setup\n');
      return;
    }

    reserves.forEach(reserve => {
      const utilizationPct = ((reserve.reservedAmount / reserve.totalAmount) * 100).toFixed(1);
      const availablePct = ((reserve.availableAmount / reserve.totalAmount) * 100).toFixed(1);

      console.log(`\n${reserve.currency}:`);
      console.log(`  Total:     ${reserve.totalAmount.toLocaleString()}`);
      console.log(`  Available: ${reserve.availableAmount.toLocaleString()} (${availablePct}%)`);
      console.log(`  Reserved:  ${reserve.reservedAmount.toLocaleString()} (${utilizationPct}%)`);
      console.log(`  Provider:  ${reserve.providerType}`);
    });

    // Step 2: Show active alerts
    console.log('\n\n🚨 Active Alerts:');
    console.log('-'.repeat(60));

    const alerts = await liquidityService.getActiveAlerts();
    
    if (alerts.length === 0) {
      console.log('✅ No active alerts - all reserves healthy\n');
    } else {
      alerts.forEach((alert: any) => {
        const icon = alert.severity === 'critical' ? '🔴' : 
                     alert.severity === 'warning' ? '🟡' : '🟢';
        
        console.log(`\n${icon} ${alert.currency} - ${alert.alert_type.toUpperCase()}`);
        console.log(`   Current:  ${Number(alert.current_amount).toLocaleString()}`);
        console.log(`   Threshold: ${Number(alert.threshold_amount).toLocaleString()}`);
        console.log(`   Action: ${alert.recommended_action}`);
      });
      console.log('');
    }

    // Step 3: Show PSP assignment statistics
    console.log('\n📈 PSP Assignment Statistics (Last 30 days):');
    console.log('-'.repeat(60));

    const stats = await getPSPAssignmentStats(30);
    
    if (!stats || stats.totalOrders === 0) {
      console.log('ℹ️  No orders processed yet\n');
    } else {
      console.log(`\nTotal Orders: ${stats.totalOrders}`);
      console.log(`  Internal:   ${stats.internalFulfillment} (${stats.internalPct}%)`);
      console.log(`  External:   ${stats.externalFulfillment} (${(100 - stats.internalPct).toFixed(1)}%)`);
      console.log(`\nCommission Capture:`);
      console.log(`  Internal earned: $${stats.internalCommissionEarned.toFixed(2)}`);
      console.log(`  External paid:   $${stats.externalCommissionPaid.toFixed(2)}`);
      console.log(`  Net capture:     $${stats.netCommissionCapture.toFixed(2)}`);
    }

    // Step 4: Revenue impact analysis
    console.log('\n\n💵 Revenue Impact Analysis:');
    console.log('-'.repeat(60));

    const impact = await calculateRevenueImpact(30);
    
    if (!impact) {
      console.log('ℹ️  Not enough data for analysis\n');
    } else {
      console.log(`\nCurrent Revenue (${impact.period}):`);
      console.log(`  Platform fees:    $${impact.current.platformFees.toFixed(2)}`);
      console.log(`  PSP commissions:  $${impact.current.pspCommissions.toFixed(2)}`);
      console.log(`  Total:            $${impact.current.total.toFixed(2)}`);
      
      console.log(`\nPotential (if 100% internal):`);
      console.log(`  Platform fees:    $${impact.potential.platformFees.toFixed(2)}`);
      console.log(`  PSP commissions:  $${impact.potential.pspCommissions.toFixed(2)}`);
      console.log(`  Total:            $${impact.potential.total.toFixed(2)}`);
      
      console.log(`\n🎯 Opportunity:`);
      console.log(`  Missed revenue:   $${impact.missedRevenue.toFixed(2)}`);
      console.log(`  Capture rate:     ${impact.capturePct}%`);
      
      if (impact.missedRevenue > 0) {
        console.log(`\n💡 Recommendation: Add more liquidity to capture $${impact.missedRevenue.toFixed(2)}`);
      }
    }

    // Step 5: Utilization stats
    console.log('\n\n📊 Utilization Statistics:');
    console.log('-'.repeat(60));

    const utilization = await liquidityService.getUtilizationStats();
    
    if (utilization.length === 0) {
      console.log('ℹ️  No utilization data available\n');
    } else {
      console.log('');
      utilization.forEach((u: any) => {
        const status = u.utilizationPct > 80 ? '🔴 HIGH' :
                      u.utilizationPct > 60 ? '🟡 MODERATE' :
                      u.utilizationPct > 40 ? '🟢 GOOD' : '⚪ LOW';
        
        console.log(`${u.currency}: ${u.utilizationPct}% utilized ${status}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Liquidity check complete\n');

  } catch (error: any) {
    console.error('\n❌ Error checking liquidity:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Run: npm run liquidity:setup');
    console.error('  2. Check DATABASE_URL is set');
    console.error('  3. Verify database connection\n');
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
