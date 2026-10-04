<?php

/* 子テーマのfunctions.phpは、親テーマのfunctions.phpより先に読み込まれることに注意してください。 */


/**
 * 親テーマのfunctions.phpのあとで読み込みたいコードはこの中に。
 */
// add_filter('after_setup_theme', function(){
// }, 11);


/**
 * 子テーマでのファイルの読み込み
 */
add_action('wp_enqueue_scripts', function() {

	$timestamp = date( 'Ymdgis', filemtime( get_stylesheet_directory() . '/style.css' ) );
	wp_enqueue_style( 'child_style', get_stylesheet_directory_uri() .'/style.css', [], $timestamp );

	// page-renewal.php テンプレート用の CSS・JS を読み込み
	if ( is_page() && get_page_template_slug() === 'page-renewal.php' ) {

		// Google Fonts の読み込み
		wp_enqueue_style( 'google_fonts', 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Shippori+Mincho+B1:wght@500;600&display=swap' );

		// リニューアル用トップページのスタイル読み込み
		$assets_css = get_stylesheet_directory() . '/assets/styles.css';
		if (file_exists($assets_css)) {
			$timestamp_assets = date( 'Ymdgis', filemtime( $assets_css ) );
			wp_enqueue_style( 'renewal_styles', get_stylesheet_directory_uri() . '/assets/styles.css', ['child_style'], $timestamp_assets );
		}

		// リニューアル用トップページのスクリプト読み込み
		$assets_js = get_stylesheet_directory() . '/assets/script.js';
		if (file_exists($assets_js)) {
			$timestamp_assets_js = date( 'Ymdgis', filemtime( $assets_js ) );
			wp_enqueue_script( 'renewal_script', get_stylesheet_directory_uri() . '/assets/script.js', [], $timestamp_assets_js, true );
		}
	}

	/* その他の読み込みファイルはこの下に記述 */

}, 11);


/**
 * WP脆弱性・セキュリティ強化対策コード
 */
remove_action('wp_head', 'wp_generator');
add_filter('xmlrpc_enabled', '__return_false');

add_filter('rest_endpoints', function ($endpoints) {
	if (isset($endpoints['/wp/v2/users'])) {
		unset($endpoints['/wp/v2/users']);
	}
	if (isset($endpoints['/wp/v2/users/(?P<id>[\d]+)'])) {
		unset($endpoints['/wp/v2/users/(?P<id>[\d]+)']);
	}
	return $endpoints;
});

add_action('template_redirect', function () {
	if (is_author()) {
		global $wp_query;
		$wp_query->set_404();
		status_header(404);
		nocache_headers();
	}
});
