-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 09, 2023 at 10:53 PM
-- Server version: 8.0.31
-- PHP Version: 8.0.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `borderbytes_menu_api`
--

DELIMITER $$
--
-- Procedures
--
DROP PROCEDURE IF EXISTS `InsertarRegistros`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertarRegistros` ()   BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE random_name VARCHAR(255);
    DECLARE food_category_list VARCHAR(255) DEFAULT 'Hamburguesa,Taco,Pizza,Sandwich,Hotdog,Sushi,Ramen,Noodles,Falafel,Kebab,Gyro,Pasta,Burrito,Empanada,Arepa,Salchipapa,Papas Fritas,Waffle,Crepe,Churro';
    
    WHILE i < 10000 DO
        SET random_name = SUBSTRING_INDEX(SUBSTRING_INDEX(food_category_list, ',', 1 + FLOOR(RAND() * 20)), ',', -1);
        
        INSERT INTO categories (name, status) VALUES (random_name, 1);
        
        SET i = i + 1;
    END WHILE;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `addons`
--

DROP TABLE IF EXISTS `addons`;
CREATE TABLE IF NOT EXISTS `addons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `min` int DEFAULT '0',
  `max` int DEFAULT '99',
  `status` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `addons`
--

INSERT INTO `addons` (`id`, `name`, `min`, `max`, `status`) VALUES
(1, 'Bebida a elegir', 1, 1, 1),
(2, 'Ensalada a eligir', 1, 1, 1),
(3, 'test edit', 11, 11, 1);

-- --------------------------------------------------------

--
-- Table structure for table `addon_details`
--

DROP TABLE IF EXISTS `addon_details`;
CREATE TABLE IF NOT EXISTS `addon_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `addon_id` bigint NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `addon_id` (`addon_id`)
) ENGINE=MyISAM AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `addon_details`
--

INSERT INTO `addon_details` (`id`, `addon_id`, `name`, `price`, `status`) VALUES
(30, 1, 'Coca Cola 600ml', '22.00', 1),
(29, 1, 'Sprite 600ml', '30.00', 1),
(34, 2, 'Ensalada 2', '23.00', 1),
(33, 2, 'Ensalada 1', '22.00', 1),
(7, 3, '1 edit', '11.00', 1),
(8, 3, '2 edit', '22.00', 1),
(28, 1, 'Mandarina 600ml', '23.00', 1),
(31, 1, 'Fanta 600ml', '26.00', 1),
(32, 1, 'Agua 600ml', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `branch_hours`
--

DROP TABLE IF EXISTS `branch_hours`;
CREATE TABLE IF NOT EXISTS `branch_hours` (
  `id` tinyint NOT NULL AUTO_INCREMENT,
  `open_hour` time NOT NULL,
  `close_hour` time NOT NULL,
  `day` tinyint NOT NULL COMMENT 'day of the week represented as a number',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `branch_hours`
--

INSERT INTO `branch_hours` (`id`, `open_hour`, `close_hour`, `day`) VALUES
(3, '08:00:00', '22:00:00', 1),
(4, '22:00:00', '22:00:00', 2);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` smallint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `image` varchar(255) NOT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `image`, `status`) VALUES
(1, 'Prueba editar2', '4632a14b-ad92-4b5e-9cab-d4d1ad3a7837', 1),
(2, 'Prueba', '2fcf4702-cf24-4a34-925b-818b9f3b5da2', 1),
(3, 'asd', '6efc18e1-de32-4fcd-8b06-9182a4824eba', 1),
(4, 'cd', '30e139be-c030-4fb7-9d99-c4a4c92c06eb', 1),
(5, 'bb', 'd8d28120-6ab1-47b6-b994-b8672298b34d', 1),
(6, 'test', '00407fb5-29eb-4e10-a789-551be5da9215', 1);

--
-- Triggers `categories`
--
DROP TRIGGER IF EXISTS `total_categoires`;
DELIMITER $$
CREATE TRIGGER `total_categoires` AFTER INSERT ON `categories` FOR EACH ROW BEGIN
UPDATE configuration SET value = value + 1 WHERE name = "total_categories";
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
CREATE TABLE IF NOT EXISTS `clients` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `name` varchar(120) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `user_id`, `name`, `phone`) VALUES
(1, 43, 'Luis Fefe', '123');

-- --------------------------------------------------------

--
-- Table structure for table `client_addresses`
--

DROP TABLE IF EXISTS `client_addresses`;
CREATE TABLE IF NOT EXISTS `client_addresses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `client_id` bigint NOT NULL,
  `address` varchar(500) NOT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `client_addresses`
--

INSERT INTO `client_addresses` (`id`, `client_id`, `address`, `latitude`, `longitude`, `status`) VALUES
(1, 1, 'Francisco coss 1187', 27, -100, 1);

-- --------------------------------------------------------

--
-- Table structure for table `configuration`
--

DROP TABLE IF EXISTS `configuration`;
CREATE TABLE IF NOT EXISTS `configuration` (
  `id` tinyint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `image_cover` varchar(255) NOT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `address` varchar(255) NOT NULL,
  `latitude` decimal(10,6) NOT NULL,
  `longitude` decimal(10,6) NOT NULL,
  `automatic` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `configuration`
--

INSERT INTO `configuration` (`id`, `name`, `image`, `image_cover`, `phone`, `address`, `latitude`, `longitude`, `automatic`) VALUES
(1, 'BorderMenu', '89239363-ab30-44d2-a70d-8315256aeb82', '837d4548-253a-4baa-9caf-1a3a73c4c134', '8781383809', 'Frasdasdasd', '1.000000', '1.000000', 0);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `payment_method_id` tinyint NOT NULL,
  `order_type_id` tinyint NOT NULL,
  `order_status_id` tinyint NOT NULL,
  `client_id` bigint NOT NULL,
  `address_id` bigint NOT NULL,
  `order_date` datetime NOT NULL,
  `shipping_cost` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_order` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `payment_method_id` (`payment_method_id`),
  KEY `order_type_id` (`order_type_id`),
  KEY `order_status_id` (`order_status_id`),
  KEY `client_id` (`client_id`),
  KEY `address_id` (`address_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `payment_method_id`, `order_type_id`, `order_status_id`, `client_id`, `address_id`, `order_date`, `shipping_cost`, `total_order`) VALUES
(1, 1, 1, 1, 1, 1, '2023-10-09 02:52:51', '200.00', '100.00');

-- --------------------------------------------------------

--
-- Table structure for table `order_addons`
--

DROP TABLE IF EXISTS `order_addons`;
CREATE TABLE IF NOT EXISTS `order_addons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_product_id` bigint NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_product_id` (`order_product_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_products`
--

DROP TABLE IF EXISTS `order_products`;
CREATE TABLE IF NOT EXISTS `order_products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `unit_kg` tinyint NOT NULL COMMENT '1 for per kg, 0 for unit',
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `comments` text,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_statuses`
--

DROP TABLE IF EXISTS `order_statuses`;
CREATE TABLE IF NOT EXISTS `order_statuses` (
  `id` tinyint NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `order_statuses`
--

INSERT INTO `order_statuses` (`id`, `name`) VALUES
(1, 'Revisión de pago'),
(2, 'Pedido en espera'),
(3, 'Aceptado por sucursal'),
(4, 'Aceptado por repartidor'),
(5, 'Pedido terminado'),
(6, 'Pedido en entrega'),
(7, 'Pedido entregado'),
(8, 'Cancelado por sucursal'),
(9, 'Cancelado por cliente'),
(10, 'Cancelado por repartidor');

-- --------------------------------------------------------

--
-- Table structure for table `order_types`
--

DROP TABLE IF EXISTS `order_types`;
CREATE TABLE IF NOT EXISTS `order_types` (
  `id` tinyint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `order_types`
--

INSERT INTO `order_types` (`id`, `name`, `status`) VALUES
(1, 'Domicilio', 1),
(2, 'Entregar', 1);

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
CREATE TABLE IF NOT EXISTS `payment_methods` (
  `id` tinyint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `payment_methods`
--

INSERT INTO `payment_methods` (`id`, `name`) VALUES
(1, 'En efectivo'),
(2, 'Transferencia');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE IF NOT EXISTS `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_id` smallint NOT NULL,
  `name` varchar(250) NOT NULL,
  `image` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `preparation_time` int DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `price_per_kg` decimal(10,2) DEFAULT NULL,
  `total_views` bigint NOT NULL DEFAULT '0' COMMENT 'filled by a trigger',
  `total_purchases` bigint NOT NULL DEFAULT '0' COMMENT 'filled by a trigger',
  `status` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `name`, `image`, `description`, `preparation_time`, `price`, `price_per_kg`, `total_views`, `total_purchases`, `status`) VALUES
(1, 2, 'asd', '5f4afae3-637a-41d6-af4c-3236138a24fe', 'asd', 1, '1.00', '1.00', 0, 0, 1),
(2, 2, 'Prueba', 'b477f4ab-d21c-4194-a6ad-d60b75820b43', 'test', 1, '1.00', '1.00', 0, 0, 1),
(3, 1, 'test', '13d44090-dc4c-4eb4-9698-087bc95ef624', 'te', 1, '12.00', '13.00', 0, 0, 1),
(4, 6, 'Prueba', '416a968d-c2a7-4ea1-8cf8-d3fcc4fa3cc3', '12', 1, '1.00', '1.00', 0, 0, 1),
(5, 2, 'tesa', '73e77695-514d-46d5-bd76-6caa0fe4f500', 'tea', 2, '2.00', '2.00', 0, 0, 1),
(6, 6, 'z', '389b2d87-da7a-40fb-a1b7-6f3de066aa94', 'z', 1, '1.00', '1.00', 0, 0, 1),
(7, 6, 'be', '3cb1c11a-d07a-4a05-909d-e52adcfdf87a', 'be', 1, '1.00', '1.00', 0, 0, 1),
(8, 2, 'asd 6', '7c023d7b-b979-4a04-8c14-c88efc21e384', 'asd', 1, '1.00', '1.00', 0, 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `product_addons`
--

DROP TABLE IF EXISTS `product_addons`;
CREATE TABLE IF NOT EXISTS `product_addons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `addon_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `addon_id` (`addon_id`),
  KEY `product_id` (`product_id`)
) ENGINE=MyISAM AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `product_addons`
--

INSERT INTO `product_addons` (`id`, `addon_id`, `product_id`) VALUES
(1, 1, 4),
(2, 2, 4),
(3, 1, 1),
(4, 2, 1),
(5, 1, 1),
(6, 2, 1),
(7, 2, 2),
(8, 3, 2),
(9, 1, 2),
(10, 1, 3),
(11, 1, 4),
(12, 1, 5),
(13, 1, 6),
(14, 1, 7),
(28, 2, 8),
(27, 1, 8);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `level_id` tinyint NOT NULL,
  `status_id` tinyint NOT NULL,
  `email` varchar(500) NOT NULL,
  `password` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `level_id` (`level_id`),
  KEY `status_id` (`status_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `level_id`, `status_id`, `email`, `password`) VALUES
(1, 1, 1, '1', '1'),
(2, 1, 1, 'gabrielvallejo2000@gmail.com', '$2b$10$/tXWOhYZGHQyFON4e/CSEuv0GQpUWQuiOb6JbOXwXzQsFsDa5tgVC'),
(3, 1, 1, 'gabrielvallejo2001@gmail.com', '$2b$10$.qFZXMqIy0XW2v1jdoVhQOaFatWPZt/mD6r5qPOFFhcyqiiUtc60y'),
(4, 2, 1, 'usuario@example.com', '$2b$10$iFHWpp43bjkPyvjY.lTS4.ACbb0SEqyo5YhwYKd4uCcRgEn/O6pLi');

-- --------------------------------------------------------

--
-- Table structure for table `user_levels`
--

DROP TABLE IF EXISTS `user_levels`;
CREATE TABLE IF NOT EXISTS `user_levels` (
  `id` tinyint NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_levels`
--

INSERT INTO `user_levels` (`id`, `name`) VALUES
(1, 'root'),
(2, 'business'),
(3, 'client');

-- --------------------------------------------------------

--
-- Table structure for table `user_statuses`
--

DROP TABLE IF EXISTS `user_statuses`;
CREATE TABLE IF NOT EXISTS `user_statuses` (
  `id` tinyint NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
