<?php
 
/*
 
Plugin Name: Metamask Custom
 
Plugin URI: https://robwfreelance.com/wordpress
 
Description: Send Ethereum using Metask.
 
Version: 1.0
 
Author: Robert Wheeler
 
Author URI: https://robwfreelance.com/
 
Text Domain: mmcustom
 
*/



// First register resources with init 
function mmc_register_scripts() {
	wp_register_script("mm-w3", plugins_url("includes/web3.min.js", __FILE__));
	wp_register_script("mm-custom-script", plugins_url("metamask.js", __FILE__), array("mm-w3"), "1.0", false);
}
add_action( 'init', 'mmc_register_scripts' );


function mm_custom_header_metadata() {
  ?>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php
}
add_action( 'wp_head', 'mm_custom_header_metadata' );


add_shortcode( 'metamask_custom', 'metamask_custom' );
function metamask_custom( $attr , $content) {
	wp_enqueue_script("mm-custom-script");
	wp_enqueue_script("mm-w3");
	wp_enqueue_style( 'pure-css', 'https://unpkg.com/purecss@2.0.6/build/pure-min.css');
	return trim('
	<div id="mm-custom-widget">
		<h3>Purchase Item Using Metamask Wallet</h3>
		<hr style="margin: 15px 0 5px 0;">
		<div id="mmcustom-stepper">
			<div id="enable-mm" style="display:none;">
				<button type="submit" class="pure-button pure-button-primary" id="btn-use-metamask" onClick="getAccounts()" style="width:100%;">Enable Metamask</button>
			</div>
			<div id="submit-mm" class="pure-form pure-form-stacked" style="display:none;">
				<label for="stacked-network">Network/Chain</label>
				<input type="text" id="stacked-network" class="mm-input mm-input-disabled" placeholder="Your wallet address" disabled />

				<label for="stacked-from-account">From Account</label>
				<input type="text" id="stacked-from-account" class="mm-input mm-input-disabled" placeholder="Your wallet address (from account)" disabled />

				<label for="stacked-from-account">To Account</label>
				<input type="text" id="stacked-to-account" class="mm-input" placeholder="Recipient wallet address (to account)" value="0xb8eb9ffcc67369f6d8f2d5ebfb33c707edfc9363" onInput="statusProxy.recipientAccount = document.getElementById(\'stacked-to-account\').value" />

				<label for="stacked-quantity">Quantity (Wei) </label>
				<input type="text" id="stacked-quantity" class="mm-input" placeholder="Enter Quantity" onInput="statusProxy.quantity = document.getElementById(\'stacked-quantity\').value" />
				<span id="hint-qty-eth" style="display:none;font-size:14px;font-weight:bold;"></span>

				<button type="submit" class="pure-button pure-button-primary" id="btn-purchase-metamask" onClick="doTransaction()"  style="width:100%;margin-top:20px;">Purchase Using Metamask</button>
			</div>
			<div id="noplugin-mm" style="display:none;">
				No Metamask Plugin detected. Please visit <a target="_NEW" href="https://metamask.io/">https://metamask.io/</a> for more details.
			</div>
		</div>
		<div id="mm-debug">
			<hr style="margin: 5px 0 5px 0;">
		</div>
	</div>

	<style scoped>
	#mm-custom-widget{
		border: 1px solid rgb(40, 48, 61);
		border-radius: 10px;
		padding: 15px;
		background: #fff;
	} 
	#mm-debug{
		display: none;
		margin: 10px 0 10px 0;
		color: grey;
	}
	#mmcustom-stepper{
		margin: 20px 5px 20px 5px;
	}
	#btn-purchase-metamask :hover{
		border: 1px solid rgb(40, 48, 61) !important;
	}
	.mm-input{
		width:100%;
	}
	.mm-input-disabled{
		color: rgb(115, 115, 115)!important;
	</style>
	');
}
